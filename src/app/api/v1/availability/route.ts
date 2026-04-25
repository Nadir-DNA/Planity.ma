import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!salonId || !date) {
      return NextResponse.json(
        { error: "salonId et date sont requis" },
        { status: 400 }
      );
    }

    // Parse date
    const requestedDate = new Date(date);
    const dayOfWeek = (requestedDate.getDay() + 6) % 7; // 0=Monday

    // Get service duration
    let duration = 30; // default
    if (serviceId) {
      const service = await db.service.findUnique({
        where: { id: serviceId },
        select: { duration: true, bufferTime: true },
      });
      if (service) {
        duration = service.duration;
      }
    }

    // Get staff members for this salon
    const staffFilter: Record<string, unknown> = {
      salonId,
      isActive: true,
    };
    if (staffId) {
      staffFilter.id = staffId;
    }

    const staffMembers = await db.staffMember.findMany({
      where: staffFilter,
      include: {
        schedules: {
          where: { dayOfWeek },
        },
        absences: {
          where: {
            startDate: { lte: new Date(date + "T23:59:59") },
            endDate: { gte: new Date(date + "T00:00:00") },
          },
        },
      },
    });

    // For each staff member, compute availability
    const startOfDay = new Date(date + "T00:00:00");
    const endOfDay = new Date(date + "T23:59:59");

    const results = await Promise.all(
      staffMembers.map(async (staff) => {
        const schedule = staff.schedules[0] || null;

        // Get existing bookings for this staff on this day
        const existingBookings = await db.bookingItem.findMany({
          where: {
            staffId: staff.id,
            startTime: { gte: startOfDay },
            endTime: { lte: endOfDay },
            booking: {
              status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
            },
          },
          select: { startTime: true, endTime: true },
        });

        const slots = computeAvailability(
          schedule,
          existingBookings,
          staff.absences,
          duration
        );

        return {
          staffId: staff.id,
          staffName: staff.displayName,
          staffColor: staff.color,
          slots,
        };
      })
    );

    return NextResponse.json({
      date,
      salonId,
      availability: results.filter((r) => r.slots.length > 0),
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des disponibilites" },
      { status: 500 }
    );
  }
}
