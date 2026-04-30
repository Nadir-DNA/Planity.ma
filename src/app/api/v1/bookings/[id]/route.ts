import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { sendBookingCancellation } from "@/server/services/notification.service";

// PATCH — Cancel a booking (set status to CANCELLED)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { cancellationReason } = body;

    // Fetch booking and verify ownership
    const booking = await db.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Cette réservation ne peut plus être annulée" },
        { status: 400 }
      );
    }

    const updated = await db.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: user.id,
        cancellationReason: cancellationReason || null,
      },
      include: {
        items: { include: { service: true, staff: true } },
        salon: { select: { id: true, name: true, slug: true, city: true, address: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
      },
    });

    // Send cancellation notification (non-blocking)
    sendBookingCancellation(id).catch(console.error);

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}

// PUT — Reschedule a booking (update startTime/endTime + BookingItem times)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { startTime: newStartTime, endTime: newEndTime } = body;

    if (!newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "Nouvelles date/heure requises" },
        { status: 400 }
      );
    }

    const parsedStart = new Date(newStartTime);
    const parsedEnd = new Date(newEndTime);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json(
        { error: "Dates invalides" },
        { status: 400 }
      );
    }

    if (parsedEnd <= parsedStart) {
      return NextResponse.json(
        { error: "L'heure de fin doit être après l'heure de début" },
        { status: 400 }
      );
    }

    // Fetch booking and verify ownership
    const booking = await db.booking.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Cette réservation ne peut plus être modifiée" },
        { status: 400 }
      );
    }

    // Calculate time shift
    const originalDuration = booking.endTime.getTime() - booking.startTime.getTime();
    const newDuration = parsedEnd.getTime() - parsedStart.getTime();

    if (newDuration !== originalDuration) {
      return NextResponse.json(
        { error: "La durée du rendez-vous ne peut pas être modifiée" },
        { status: 400 }
      );
    }

    // Check availability for each booking item's staff at the new time
    const timeShift = parsedStart.getTime() - booking.startTime.getTime();

    for (const item of booking.items) {
      const newStart = new Date(item.startTime.getTime() + timeShift);
      const newEnd = new Date(item.endTime.getTime() + timeShift);

      const conflicting = await db.bookingItem.findFirst({
        where: {
          id: { not: item.id },
          staffId: item.staffId,
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
          booking: {
            status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          },
        },
      });

      if (conflicting) {
        return NextResponse.json(
          { error: "Le créneau demandé n'est pas disponible" },
          { status: 409 }
        );
      }
    }

    // Update in a transaction
    const updated = await db.$transaction(async (tx) => {
      // Update each booking item's times
      for (const item of booking.items) {
        const newStart = new Date(item.startTime.getTime() + timeShift);
        const newEnd = new Date(item.endTime.getTime() + timeShift);

        await tx.bookingItem.update({
          where: { id: item.id },
          data: {
            startTime: newStart,
            endTime: newEnd,
          },
        });
      }

      // Update the booking itself
      return tx.booking.update({
        where: { id },
        data: {
          startTime: parsedStart,
          endTime: parsedEnd,
        },
        include: {
          items: { include: { service: true, staff: true } },
          salon: { select: { id: true, name: true, slug: true, city: true, address: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          payment: true,
        },
      });
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking reschedule error:", error);
    return NextResponse.json(
      { error: "Erreur lors du report" },
      { status: 500 }
    );
  }
}