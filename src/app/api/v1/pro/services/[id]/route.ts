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

    // Verify service belongs to this salon
    const { data: existing } = await supabaseAdmin
      .from("Service")
      .select("id, salonId")
      .eq("id", id)
      .maybeSingle();

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { name, price, duration, description, categoryId, isOnlineBookable, isActive, bufferTime, assignedStaffIds } = body;

    // Update staff assignments if provided
    if (assignedStaffIds !== undefined) {
      // Delete existing assignments
      await supabaseAdmin
        .from("StaffService")
        .delete()
        .eq("serviceId", id);

      if (assignedStaffIds.length > 0) {
        const staffAssignments = assignedStaffIds.map((staffId: string) => ({
          serviceId: id,
          staffId,
        }));
        await supabaseAdmin.from("StaffService").insert(staffAssignments);
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isOnlineBookable !== undefined) updateData.isOnlineBookable = isOnlineBookable;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (bufferTime !== undefined) updateData.bufferTime = parseInt(bufferTime);

    const { data: service, error: updateError } = await supabaseAdmin
      .from("Service")
      .update(updateData)
      .eq("id", id)
      .select("*, category:ServiceCategory(name), assignedStaff:StaffService(staffId, staff:StaffMember(id, displayName, color))")
      .single();

    if (updateError) {
      console.error("Service update error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la modification du service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du service" },
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
      .from("Service")
      .select("id, salonId")
      .eq("id", id)
      .maybeSingle();

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("Service")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Service delete error:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du service" },
      { status: 500 }
    );
  }
}