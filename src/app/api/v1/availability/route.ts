import { NextResponse } from "next/server";
import { MOCK_SALONS } from "@/lib/mock-data";

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

    // Try DB first
    try {
      const { db } = await import("@/lib/db");
      const { computeAvailability } = await import("@/lib/availability");

      const requestedDate = new Date(date);
      const dayOfWeek = (requestedDate.getDay() + 6) % 7; // 0=Monday

      let duration = 30;
      if (serviceId) {
        const service = await db.service.findUnique({
          where: { id: serviceId },
          select: { duration: true, bufferTime: true },
        });
        if (service) {
          duration = service.duration;
        }
      }

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

      const startOfDay = new Date(date + "T00:00:00");
      const endOfDay = new Date(date + "T23:59:59");

      const results = await Promise.all(
        staffMembers.map(async (staff) => {
          const schedule = staff.schedules[0] || null;

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
    } catch {
      // DB not available — generate mock availability
    }

    // Fallback: mock availability based on salon data
    const salon = MOCK_SALONS.find((s) => s.id === salonId);

    if (!salon) {
      return NextResponse.json(
        { error: "Salon introuvable" },
        { status: 404 }
      );
    }

    const requestedDate = new Date(date);
    const dayOfWeek = (requestedDate.getDay() + 6) % 7; // 0=Monday
    const isToday = new Date().toDateString() === requestedDate.toDateString();

    // Filter staff by staffId if provided
    const staffList = staffId
      ? salon.staff.filter((s) => s.id === staffId)
      : salon.staff.filter((s) => s.isActive);

    // Find opening hours for this day
    const hours = salon.openingHours.find((h) => h.dayOfWeek === dayOfWeek);

    if (!hours || hours.isClosed) {
      return NextResponse.json({
        date,
        salonId,
        availability: [],
      });
    }

    const availability = staffList.map((member) => {
      // Generate mock slots from opening hours
      const openMinutes = parseInt(hours.openTime.split(":")[0]) * 60 + parseInt(hours.openTime.split(":")[1]);
      const closeMinutes = parseInt(hours.closeTime.split(":")[0]) * 60 + parseInt(hours.closeTime.split(":")[1]);

      // Find service duration
      const service = serviceId
        ? salon.services.find((s) => s.id === serviceId)
        : null;
      const duration = service?.duration || 30;

      // If today, start from next available slot (current time + 1h)
      const startMinutes = isToday
        ? Math.max(openMinutes, new Date().getHours() * 60 + new Date().getMinutes() + 60)
        : openMinutes;

      const slots: { start: string; end: string }[] = [];
      for (let mins = startMinutes; mins + duration <= closeMinutes; mins += 30) {
        const startH = Math.floor(mins / 60);
        const startM = mins % 60;
        const endMins = mins + duration;
        const endH = Math.floor(endMins / 60);
        const endM = endMins % 60;
        slots.push({
          start: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`,
          end: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`,
        });
      }

      return {
        staffId: member.id,
        staffName: member.displayName,
        staffColor: member.color,
        slots,
      };
    });

    return NextResponse.json({
      date,
      salonId,
      availability: availability.filter((a) => a.slots.length > 0),
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des disponibilités" },
      { status: 500 }
    );
  }
}