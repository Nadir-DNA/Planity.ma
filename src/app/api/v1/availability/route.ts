import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMockSalon, MOCK_SALONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface Slot {
  start: string;
  end: string;
}

interface StaffAvailability {
  staffId: string;
  staffName: string;
  staffColor: string;
  slots: Slot[];
}

interface OpeningHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface StaffInfo {
  id: string;
  displayName: string;
  color: string;
  isActive: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateAvailableSlots(
  openTime: string,
  closeTime: string,
  duration: number,
  bookedIntervals: { start: number; end: number }[],
  intervalMinutes: number = 15
): Slot[] {
  const openMin = timeToMinutes(openTime);
  const closeMin = timeToMinutes(closeTime);
  const available: { start: number; end: number }[] = [{ start: openMin, end: closeMin }];

  let free = [...available];
  for (const booking of bookedIntervals) {
    const next: { start: number; end: number }[] = [];
    for (const slot of free) {
      if (booking.end <= slot.start || booking.start >= slot.end) {
        next.push(slot);
      } else {
        if (slot.start < booking.start) next.push({ start: slot.start, end: booking.start });
        if (slot.end > booking.end) next.push({ start: booking.end, end: slot.end });
      }
    }
    free = next;
  }

  const slots: Slot[] = [];
  for (const interval of free) {
    let current = interval.start;
    const remainder = current % intervalMinutes;
    if (remainder !== 0) current += intervalMinutes - remainder;
    while (current + duration <= interval.end) {
      slots.push({
        start: minutesToTime(current),
        end: minutesToTime(current + duration),
      });
      current += intervalMinutes;
    }
  }
  return slots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const dateStr = searchParams.get("date");
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");

    if (!salonId || !dateStr) {
      return NextResponse.json({ error: "salonId et date sont requis" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const jsDay = date.getDay();
    const schemaDay = (jsDay + 6) % 7;

    // Try mock data first
    const mockSalon = getMockSalon(salonId) || MOCK_SALONS.find(s => s.id === salonId);
    const isMock = !!mockSalon;

    // Get opening hours
    let openingHours: OpeningHour[] = [];
    let staffMembers: StaffInfo[] = [];
    let serviceDuration = 30;

    if (isMock && mockSalon) {
      openingHours = mockSalon.openingHours;
      staffMembers = staffId
        ? mockSalon.staff.filter(s => s.id === staffId && s.isActive)
        : mockSalon.staff.filter(s => s.isActive);

      if (serviceId) {
        const svc = mockSalon.services.find(s => s.id === serviceId);
        if (svc) serviceDuration = svc.duration;
      } else if (mockSalon.services.length) {
        serviceDuration = Math.min(...mockSalon.services.filter(s => s.isOnlineBookable !== false).map(s => s.duration));
      }
    } else {
      // DB mode — fetch from Supabase
      const { data: dbSalon } = await supabaseAdmin
        .from("Salon")
        .select("id, name, slug")
        .eq("id", salonId)
        .maybeSingle();

      if (!dbSalon) {
        return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
      }

      // Fetch opening hours from DB
      // TODO: When OpeningHours table exists in Supabase
      // For now, default to standard Moroccan salon hours
      openingHours = [
        { dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
        { dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
      ];

      // Fetch staff from DB
      let staffQuery = supabaseAdmin
        .from("StaffMember")
        .select("id, displayName, color, isActive")
        .eq("salonId", salonId)
        .eq("isActive", true);

      if (staffId) staffQuery = staffQuery.eq("id", staffId);

      const { data: dbStaff } = await staffQuery;
      if (dbStaff && dbStaff.length > 0) {
        staffMembers = dbStaff.map(s => ({
          id: s.id,
          displayName: s.displayName,
          color: s.color || "#000000",
          isActive: true,
        }));
      }

      // Fetch service duration from DB
      if (serviceId) {
        const { data: dbService } = await supabaseAdmin
          .from("Service")
          .select("duration")
          .eq("id", serviceId)
          .maybeSingle();
        if (dbService) serviceDuration = dbService.duration;
      }

      if (staffMembers.length === 0 && !staffId) {
        staffMembers = [{ id: "any", displayName: "Premier disponible", color: "#000000", isActive: true }];
      }
    }

    // Get day's opening hours
    const dayHours = openingHours.find(h => h.dayOfWeek === schemaDay);

    if (!dayHours || dayHours.isClosed) {
      return NextResponse.json({ date: dateStr, salonId, availability: [] });
    }

    // Fetch existing bookings for this date (DB mode only)
    let existingBookings: Array<{ staffId: string; startTime: string; endTime: string }> = [];

    if (!isMock) {
      const staffIds = staffMembers.map(s => s.id).filter(id => id !== "any");
      if (staffIds.length > 0) {
        const { data: bookedItems } = await supabaseAdmin
          .from("BookingItem")
          .select("staffId, startTime, endTime")
          .in("staffId", staffIds)
          .gte("startTime", `${dateStr}T00:00:00`)
          .lte("startTime", `${dateStr}T23:59:59`);

        if (bookedItems) {
          existingBookings = bookedItems.map((item: Record<string, unknown>) => ({
            staffId: item.staffId as string,
            startTime: item.startTime as string,
            endTime: item.endTime as string,
          }));
        }
      }
    }

    // Now: check date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateStr + "T00:00:00");
    if (bookingDate < today) {
      return NextResponse.json({ date: dateStr, salonId, availability: [] });
    }

    // Generate per-staff availability
    const availability: StaffAvailability[] = staffMembers.map((member) => {
      // Filter bookings for this staff
      const memberBookings = existingBookings
        .filter(b => b.staffId === member.id)
        .map(b => {
          const startTime = b.startTime.includes("T") ? b.startTime.split("T")[1].substring(0, 5) : b.startTime.substring(0, 5);
          const endTime = b.endTime.includes("T") ? b.endTime.split("T")[1].substring(0, 5) : b.endTime.substring(0, 5);
          return {
            start: timeToMinutes(startTime),
            end: timeToMinutes(endTime) + 5, // 5min buffer
          };
        });

      const bookingsToSubtract = member.id === "any" ? [] : memberBookings;

      let slots: Slot[] = generateAvailableSlots(
        dayHours.openTime,
        dayHours.closeTime,
        serviceDuration,
        bookingsToSubtract
      );

      // For mock data: add staff-specific variation
      if (isMock && mockSalon) {
        const seed = member.id.charCodeAt(member.id.length - 1) + date.getDate();
        
        // Remove some slots for variety (different pattern per staff)
        slots = slots.filter((_, i) => (seed + i) % 4 !== 0);

        // Staff-specific lunch break
        const lunchStart = 12 * 60 + (seed % 3) * 15;
        const lunchEnd = lunchStart + 60;
        slots = slots.filter(s => {
          const slotStart = timeToMinutes(s.start);
          return slotStart < lunchStart || slotStart >= lunchEnd;
        });
      }

      // Filter out past time slots for today
      const now = new Date();
      if (dateStr === now.toISOString().split("T")[0]) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes() + 30;
        slots = slots.filter(s => timeToMinutes(s.start) > currentMinutes);
      }

      return {
        staffId: member.id,
        staffName: member.displayName,
        staffColor: member.color,
        slots,
      };
    });

    const result = staffId
      ? availability.filter(a => a.staffId === staffId)
      : availability;

    return NextResponse.json({
      date: dateStr,
      salonId,
      availability: result,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des disponibilités" },
      { status: 500 }
    );
  }
}