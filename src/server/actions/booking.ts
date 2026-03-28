"use server";

import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/utils";
import { createBookingSchema, type CreateBookingInput } from "@/server/validators/booking.schema";

export async function createBooking(input: CreateBookingInput) {
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
    for (const svc of data.services) {
      if (svc.staffId) {
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
    }

    const newBooking = await tx.booking.create({
      data: {
        reference: reference!,
        userId: "placeholder-user-id", // TODO: get from auth session
        salonId: data.salonId,
        startTime,
        endTime,
        totalPrice,
        source: "ONLINE",
        notes: data.notes,
        items: {
          create: data.services.map((svc, i) => {
            const service = services.find((s) => s.id === svc.serviceId)!;
            const itemStart = new Date(
              startTime.getTime() +
                services
                  .slice(0, i)
                  .reduce((sum, s) => sum + s.duration, 0) * 60000
            );
            const itemEnd = new Date(
              itemStart.getTime() + service.duration * 60000
            );
            return {
              serviceId: svc.serviceId,
              staffId: svc.staffId || "placeholder-staff-id", // TODO: assign first available
              startTime: itemStart,
              endTime: itemEnd,
              price: service.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    return newBooking;
  });

  return { success: true, booking };
}
