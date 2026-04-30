import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Find salon owned by user
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { data: existing } = await supabaseAdmin
      .from("StaffMember")
      .select("id, salonId")
      .eq("id", id)
      .maybeSingle();

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, title, bio, color, isActive, schedules } = body;

    // Update schedules if provided
    if (schedules !== undefined) {
      // Delete existing schedules
      await supabaseAdmin
        .from("StaffSchedule")
        .delete()
        .eq("staffId", id);

      if (schedules.length > 0) {
        const scheduleData = schedules.map(
          (s: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }) => ({
            staffId: id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isWorking: s.isWorking,
          })
        );
        await supabaseAdmin.from("StaffSchedule").insert(scheduleData);
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { data: staffMember, error: updateError } = await supabaseAdmin
      .from("StaffMember")
      .update(updateData)
      .eq("id", id)
      .select("*, schedules:StaffSchedule(*), services:StaffService(serviceId, service:Service(id, name))")
      .single();

    if (updateError) {
      console.error("Staff update error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la modification du membre" },
        { status: 500 }
      );
    }

    return NextResponse.json({ staff: staffMember });
  } catch (error) {
    console.error("Staff update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du membre" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Find salon owned by user
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { data: existing } = await supabaseAdmin
      .from("StaffMember")
      .select("id, salonId")
      .eq("id", id)
      .maybeSingle();

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("StaffMember")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Staff delete error:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du membre" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    );
  }
}