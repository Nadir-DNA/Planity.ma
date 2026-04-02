import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/utils";

interface CreateBookingParams {
  userId: string;
  salonId: string;
  services: { serviceId: string; staffId?: string }[];
  date: string;
  time: string;
  notes?: string;
}

export async function createBooking(params: CreateBookingParams) {
  const { userId, salonId, services, date, time, notes } = params;

  // Fetch service details
  const serviceIds = services.map((s) => s.serviceId);
  const dbServices = await db.service.findMany({
    where: { id: { in: serviceIds }, salonId },
  });

  if (dbServices.length !== serviceIds.length) {
    throw new Error("Un ou plusieurs services sont invalides");
  }

  const totalPrice = dbServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = dbServices.reduce((sum, s) => sum + s.duration, 0);

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + totalDuration * 60000);

  // Generate unique reference
  let reference = generateBookingReference();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db.booking.findUnique({ where: { reference } });
    if (!existing) break;
    reference = generateBookingReference();
    attempts++;
  }

  // Create in transaction with optimistic locking
  return db.$transaction(async (tx) => {
    // Check for conflicts
    for (const svc of services) {
      if (svc.staffId) {
        const conflicting = await tx.bookingItem.findFirst({
          where: {
            staffId: svc.staffId,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            booking: {
              status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
            },
          },
        });
        if (conflicting) {
          throw new Error("Creneau non disponible");
        }
      }
    }

    let currentStart = startTime;
    const items = services.map((svc) => {
      const service = dbServices.find((s) => s.id === svc.serviceId)!;
      const itemEnd = new Date(currentStart.getTime() + service.duration * 60000);
      const item = {
        serviceId: svc.serviceId,
        staffId: svc.staffId!,
        startTime: new Date(currentStart),
        endTime: itemEnd,
        price: service.price,
      };
      currentStart = itemEnd;
      return item;
    });

    return tx.booking.create({
      data: {
        reference,
        userId,
        salonId,
        startTime,
        endTime,
        totalPrice,
        source: "ONLINE",
        status: "CONFIRMED",
        notes,
        items: { create: items },
      },
      include: {
        items: { include: { service: true, staff: true } },
        salon: { select: { name: true, slug: true, phone: true, email: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });
  });
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
) {
  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ userId }, { salon: { ownerId: userId } }],
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (!booking) {
    throw new Error("Reservation non trouvee ou non annulable");
  }

  return db.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: userId,
    },
  });
}

export async function getUserBookings(userId: string, status?: string) {
  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;

  return db.booking.findMany({
    where,
    orderBy: { startTime: "desc" },
    include: {
      items: { include: { service: true, staff: true } },
      salon: { select: { name: true, slug: true, city: true, address: true } },
      payment: true,
    },
  });
}

export async function getSalonBookings(
  salonId: string,
  date?: string,
  staffId?: string
) {
  const where: Record<string, unknown> = { salonId };

  if (date) {
    const dayStart = new Date(date + "T00:00:00");
    const dayEnd = new Date(date + "T23:59:59");
    where.startTime = { gte: dayStart };
    where.endTime = { lte: dayEnd };
  }

  if (staffId) {
    where.items = { some: { staffId } };
  }

  return db.booking.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: {
      items: { include: { service: true, staff: true } },
      user: { select: { name: true, phone: true, email: true } },
    },
  });
}
