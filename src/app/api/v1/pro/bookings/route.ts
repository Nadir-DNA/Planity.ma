import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const salon = await db.salon.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      salonId: salon.id,
    };

    if (status) {
      where.status = status;
    } else {
      // Default: show active bookings (not cancelled)
      where.status = { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] };
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.startTime = { gte: dayStart, lte: dayEnd };
    } else if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            service: { select: { id: true, name: true, price: true, duration: true } },
            staff: { select: { id: true, displayName: true, color: true } },
          },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Pro bookings fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des réservations" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const salon = await db.salon.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { bookingId, status: newStatus, cancellationReason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requis" }, { status: 400 });
    }

    const booking = await db.booking.findFirst({
      where: { id: bookingId, salonId: salon.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        ...(newStatus && { status: newStatus }),
        ...(newStatus === "CANCELLED" && {
          cancelledAt: new Date(),
          cancellationReason: cancellationReason || null,
        }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            service: { select: { id: true, name: true, price: true } },
            staff: { select: { id: true, displayName: true, color: true } },
          },
        },
      },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}