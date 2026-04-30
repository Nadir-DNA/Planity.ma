import { NextResponse } from "next/server";
import { getMockSalon } from "@/lib/mock-data";

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

function generateSlots(
  openTime: string,
  closeTime: string,
  slotDuration: number = 30
): Slot[] {
  const slots: Slot[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  
  let startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;
  
  while (startMinutes + slotDuration <= endMinutes) {
    const startH = Math.floor(startMinutes / 60);
    const startM = startMinutes % 60;
    const endMin = startMinutes + slotDuration;
    const endH = Math.floor(endMin / 60);
    const endMm = endMin % 60;
    
    slots.push({
      start: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      end: `${String(endH).padStart(2, "0")}:${String(endMm).padStart(2, "0")}`,
    });
    
    startMinutes += slotDuration;
  }
  
  return slots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const dateStr = searchParams.get("date");
    const staffId = searchParams.get("staffId");

    if (!salonId || !dateStr) {
      return NextResponse.json(
        { error: "salonId et date sont requis" },
        { status: 400 }
      );
    }

    // Find salon in mock data (use salonId as slug for now)
    const salon = getMockSalon(salonId) || 
      // Also try matching by id
      Object.values(MOCK_SALONS_MAP).find(s => s.id === salonId);

    if (!salon) {
      return NextResponse.json(
        { error: "Salon non trouvé" },
        { status: 404 }
      );
    }

    // Determine day of week for the given date
    const date = new Date(dateStr);
    const jsDay = date.getDay(); // 0=Sunday
    const schemaDay = (jsDay + 6) % 7; // Convert to 0=Monday
    
    const dayHours = salon.openingHours.find(h => h.dayOfWeek === schemaDay);
    
    if (!dayHours || dayHours.isClosed) {
      return NextResponse.json({
        date: dateStr,
        salonId,
        availability: [],
      });
    }

    const allSlots = generateSlots(dayHours.openTime, dayHours.closeTime, 30);
    
    // Deterministically mark some slots as unavailable based on date
    const dateNum = date.getDate();
    const filteredSlots = allSlots.filter((_, i) => (i + dateNum) % 3 !== 0);

    // Generate availability per staff member
    const staffMembers = staffId 
      ? salon.staff.filter(s => s.id === staffId)
      : salon.staff.filter(s => s.isActive);

    const availability: StaffAvailability[] = staffMembers.map((member) => ({
      staffId: member.id,
      staffName: member.displayName,
      staffColor: member.color,
      slots: filteredSlots,
    }));

    return NextResponse.json({
      date: dateStr,
      salonId,
      availability,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des disponibilités" },
      { status: 500 }
    );
  }
}

// Need to import MOCK_SALONS for the id lookup
import { MOCK_SALONS } from "@/lib/mock-data";
const MOCK_SALONS_MAP: Record<string, typeof MOCK_SALONS[number]> = {};
MOCK_SALONS.forEach(s => { MOCK_SALONS_MAP[s.id] = s; MOCK_SALONS_MAP[s.slug] = s; });
