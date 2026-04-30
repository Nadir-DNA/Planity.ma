"use server";

import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { generateBookingReference } from "@/lib/utils";
import { createBookingSchema, type CreateBookingInput } from "@/server/validators/booking.schema";

export async function createBooking(input: CreateBookingInput) {
  // Verify authentication
  const user = await getUser();
  if (!user?.id) {
    return { error: "Authentification requise" };
  }

  const data = createBookingSchema.parse(input);

  // Fetch services to calculate total price and duration
  const serviceIds = data.services.map((s) => s.serviceId);
  const services = await db.service.findMany({
    where: { id: { in: serviceIds }, salonId: data.salonId },
  });

  if (services.length !== serviceIds.length) {
    return { error: "Un ou plusieurs services sont invalides" };
  }

  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

  // Parse start time
  const [year, month, day] = data.date.split("-").map(Number);
  const [hours, minutes] = data.time.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + totalDuration * 60000);

  // Resolve staff IDs: for services without a staffId, find an eligible staff member
  type ResolvedService = { serviceId: string; staffId: string };
  const resolvedServices: ResolvedService[] = await Promise.all(
    data.services.map(async (svc): Promise<ResolvedService> => {
      if (svc.staffId) return { serviceId: svc.serviceId, staffId: svc.staffId };

      // No staff preference — find first active staff member assigned to this service
      const assignedStaff = await db.staffMember.findFirst({
        where: {
          isActive: true,
          salonId: data.salonId,
          services: { some: { serviceId: svc.serviceId } },
        },
      });

      if (assignedStaff) {
        return { serviceId: svc.serviceId, staffId: assignedStaff.id };
      }

      // Fallback: any active staff member in the salon
      const salonStaff = await db.staffMember.findFirst({
        where: { salonId: data.salonId, isActive: true },
      });

      if (!salonStaff) {
        throw new Error("Aucun professionnel disponible dans ce salon");
      }

      return { serviceId: svc.serviceId, staffId: salonStaff.id };
    })
  );

  // Generate unique reference
  let reference: string;
  let attempts = 0;
  do {
    reference = generateBookingReference();
    const existing = await db.booking.findUnique({ where: { reference } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  // Create booking with items (in a transaction for atomicity)
  const booking = await db.$transaction(async (tx) => {
    // Double-check availability within transaction
    for (const svc of resolvedServices) {
      const conflicting = await tx.bookingItem.findFirst({
        where: {
          staffId: svc.staffId,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          booking: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
        },
      });
      if (conflicting) {
        throw new Error(
          "Le creneau n'est plus disponible pour ce professionnel"
        );
      }
    }

    let itemStartTime = startTime;
    const items = resolvedServices.map((svc) => {
      const service = services.find((s) => s.id === svc.serviceId)!;
      const itemEndTime = new Date(itemStartTime.getTime() + service.duration * 60000);
      const item = {
        serviceId: svc.serviceId,
        staffId: svc.staffId,
        startTime: new Date(itemStartTime),
        endTime: itemEndTime,
        price: service.price,
      };
      itemStartTime = itemEndTime;
      return item;
    });

    const newBooking = await tx.booking.create({
      data: {
        reference: reference!,
        userId: user.id,
        salonId: data.salonId,
        startTime,
        endTime,
        totalPrice,
        source: "ONLINE",
        status: "CONFIRMED",
        notes: data.notes,
        items: {
          create: items,
        },
      },
      include: { items: { include: { service: true, staff: true } } },
    });

    return newBooking;
  });

  return { success: true, booking };
}
