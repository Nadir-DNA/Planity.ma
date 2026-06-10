import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/v1/pro/salon — Get salon settings
export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("*")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    // Get opening hours
    const { data: schedule } = await supabaseAdmin
      .from("SalonSchedule")
      .select("*")
      .eq("salonId", salon.id)
      .order("dayOfWeek", { ascending: true });

    // Get photos
    const { data: photos } = await supabaseAdmin
      .from("SalonPhoto")
      .select("*")
      .eq("salonId", salon.id)
      .order("order", { ascending: true });

    return NextResponse.json({ salon, schedule: schedule || [], photos: photos || [] });
  } catch (error) {
    console.error("GET /api/v1/pro/salon error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/v1/pro/salon — Update salon settings
export async function PATCH(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, address, city, postalCode, phone, email, description, openingHours } = body;

    // Update salon info
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date().toISOString();

    if (Object.keys(updateData).length > 1) {
      const { error: updateError } = await supabaseAdmin
        .from("Salon")
        .update(updateData)
        .eq("id", salon.id);

      if (updateError) {
        console.error("Salon update error:", updateError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
      }
    }

    // Update opening hours if provided
    if (openingHours && Array.isArray(openingHours)) {
      // Delete existing schedule
      await supabaseAdmin
        .from("SalonSchedule")
        .delete()
        .eq("salonId", salon.id);

      // Insert new schedule
      const scheduleData = openingHours
        .filter((h: { isOpen: boolean }) => h.isOpen)
        .map((h: { dayOfWeek: number; openTime: string; closeTime: string }) => ({
          salonId: salon.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: false,
        }));

      if (scheduleData.length > 0) {
        const { error: scheduleError } = await supabaseAdmin
          .from("SalonSchedule")
          .insert(scheduleData);

        if (scheduleError) {
          console.error("Schedule update error:", scheduleError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/v1/pro/salon error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
