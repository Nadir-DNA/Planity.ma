import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Find salon owned by user
    const { data: salon, error: salonError } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { data: staff, error: staffError } = await supabaseAdmin
      .from("StaffMember")
      .select("*, schedules:StaffSchedule(*), services:StaffService(serviceId, service:Service(id, name))")
      .eq("salonId", salon.id)
      .order("order", { ascending: true });

    if (staffError) {
      console.error("Staff fetch error:", staffError);
      return NextResponse.json(
        { error: "Erreur lors du chargement de l'équipe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ staff: staff || [] });
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de l'équipe" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Find salon owned by user
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, title, bio, color, isActive, schedules } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "Le nom est obligatoire" },
        { status: 400 }
      );
    }

    // Get max order
    const { data: maxOrderStaff } = await supabaseAdmin
      .from("StaffMember")
      .select("order")
      .eq("salonId", salon.id)
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderStaff?.order ?? -1) + 1;

    // Create staff member
    const { data: staffMember, error: createError } = await supabaseAdmin
      .from("StaffMember")
      .insert({
        salonId: salon.id,
        displayName,
        title: title || null,
        bio: bio || null,
        color: color || "#3B82F6",
        isActive: isActive ?? true,
        order: nextOrder,
      })
      .select()
      .single();

    if (createError) {
      console.error("Staff creation error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la création du membre" },
        { status: 500 }
      );
    }

    // Create schedules if provided
    if (schedules?.length) {
      const scheduleData = schedules.map(
        (s: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }) => ({
          staffId: staffMember.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isWorking: s.isWorking,
        })
      );
      await supabaseAdmin.from("StaffSchedule").insert(scheduleData);
    }

    // Re-fetch with relations
    const { data: fullStaff } = await supabaseAdmin
      .from("StaffMember")
      .select("*, schedules:StaffSchedule(*), services:StaffService(serviceId, service:Service(id, name))")
      .eq("id", staffMember.id)
      .single();

    return NextResponse.json({ staff: fullStaff || staffMember }, { status: 201 });
  } catch (error) {
    console.error("Staff creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du membre" },
      { status: 500 }
    );
  }
}