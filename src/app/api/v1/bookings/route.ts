import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const salonId = searchParams.get("salonId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (salonId) where.salonId = salonId;
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: {
              service: true,
              staff: true,
            },
          },
          salon: {
            select: { id: true, name: true, slug: true, city: true, address: true },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          payment: true,
        },
      }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salonId, userId, services, date, time, notes } = body;

    if (!salonId || !userId || !services?.length || !date || !time) {
      return NextResponse.json(
        { error: "Donnees manquantes" },
        { status: 400 }
      );
    }

    // Fetch services
    const serviceIds = services.map((s: { serviceId: string }) => s.serviceId);
    const dbServices = await db.service.findMany({
      where: { id: { in: serviceIds }, salonId },
    });

    if (dbServices.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs services sont invalides" },
        { status: 400 }
      );
    }

    const totalPrice = dbServices.reduce((sum: number, s: { price: number }) => sum + s.price, 0);
    const totalDuration = dbServices.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    // Generate unique reference
    let reference = generateBookingReference();
    let existing = await db.booking.findUnique({ where: { reference } });
    let attempts = 0;
    while (existing && attempts < 10) {
      reference = generateBookingReference();
      existing = await db.booking.findUnique({ where: { reference } });
      attempts++;
    }

    // Create booking in transaction
    const booking = await db.$transaction(async (tx) => {
      // Check availability for each service/staff combo
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
            throw new Error("Creneau non disponible pour ce professionnel");
          }
        }
      }

      let itemStartTime = startTime;
      const items = services.map((svc: { serviceId: string; staffId?: string }) => {
        const service = dbServices.find((s: { id: string }) => s.id === svc.serviceId)!;
        const itemEndTime = new Date(itemStartTime.getTime() + (service as { duration: number }).duration * 60000);
        const item = {
          serviceId: svc.serviceId,
          staffId: svc.staffId || services[0].staffId,
          startTime: new Date(itemStartTime),
          endTime: itemEndTime,
          price: (service as { price: number }).price,
        };
        itemStartTime = itemEndTime;
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
          salon: { select: { name: true, slug: true } },
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la creation";
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
