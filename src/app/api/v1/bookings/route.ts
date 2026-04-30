import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { paginationSchema } from "@/lib/validations";
import { generateBookingReference } from "@/lib/utils";
import { sendBookingConfirmation, sendBookingCancellation } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const salonId = searchParams.get("salonId");
    const status = searchParams.get("status");
    
    // Validate pagination with Zod
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

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
    // Return empty result as fallback instead of 500
    return NextResponse.json({
      bookings: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { salonId, services, date, time, notes } = body;

    // Use authenticated user's ID — never trust client-sent userId
    const userId = session.user.id;

    if (!salonId || !services?.length || !date || !time) {
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

    // Resolve staff IDs: for services without a staffId, find an eligible staff member
    const resolvedServices = await Promise.all(
      services.map(async (svc: { serviceId: string; staffId?: string }) => {
        if (svc.staffId) return svc;

        // No staff preference — find first active staff member assigned to this service
        const assignedStaff = await db.staffMember.findFirst({
          where: {
            isActive: true,
            salonId,
            services: { some: { serviceId: svc.serviceId } },
          },
        });

        if (assignedStaff) {
          return { ...svc, staffId: assignedStaff.id };
        }

        // Fallback: any active staff member in the salon
        const salonStaff = await db.staffMember.findFirst({
          where: { salonId, isActive: true },
        });

        if (!salonStaff) {
          throw new Error("Aucun professionnel disponible dans ce salon");
        }

        return { ...svc, staffId: salonStaff.id };
      })
    );

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
      for (const svc of resolvedServices) {
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

      let itemStartTime = startTime;
      const items = resolvedServices.map((svc: { serviceId: string; staffId: string }) => {
        const service = dbServices.find((s: { id: string }) => s.id === svc.serviceId)!;
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

    // Send confirmation email/SMS (non-blocking)
    sendBookingConfirmation(booking.id).catch(console.error);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la creation";
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId requis" },
        { status: 400 }
      );
    }

    // Check ownership: user owns booking OR user owns salon
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { userId: session.user.id },
          { salon: { ownerId: session.user.id } },
        ],
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reservation non trouvee ou non annulable" },
        { status: 404 }
      );
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Send cancellation email (non-blocking)
    sendBookingCancellation(bookingId).catch(console.error);

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}
