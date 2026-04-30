import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
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

    const { data: services, error: svcError } = await supabaseAdmin
      .from("Service")
      .select("*, category:ServiceCategory(name), assignedStaff:StaffService(staffId, staff:StaffMember(id, displayName, color))")
      .eq("salonId", salon.id)
      .order("order", { ascending: true });

    if (svcError) {
      console.error("Services fetch error:", svcError);
      return NextResponse.json(
        { error: "Erreur lors du chargement des services" },
        { status: 500 }
      );
    }

    return NextResponse.json({ services: services || [] });
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser(request);
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
    const { name, price, duration, description, categoryId, isOnlineBookable, isActive, bufferTime, assignedStaffIds } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Nom, prix et durée sont obligatoires" },
        { status: 400 }
      );
    }

    // Get max order
    const { data: maxOrderService } = await supabaseAdmin
      .from("Service")
      .select("order")
      .eq("salonId", salon.id)
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderService?.order ?? -1) + 1;

    const { data: service, error: createError } = await supabaseAdmin
      .from("Service")
      .insert({
        salonId: salon.id,
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description: description || null,
        categoryId: categoryId || null,
        isOnlineBookable: isOnlineBookable ?? true,
        isActive: isActive ?? true,
        bufferTime: bufferTime ? parseInt(bufferTime) : 0,
        order: nextOrder,
      })
      .select("*, category:ServiceCategory(name), assignedStaff:StaffService(staffId, staff:StaffMember(id, displayName, color))")
      .single();

    if (createError) {
      console.error("Service creation error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la création du service" },
        { status: 500 }
      );
    }

    // Create staff assignments if provided
    if (assignedStaffIds?.length) {
      const staffAssignments = assignedStaffIds.map((staffId: string) => ({
        serviceId: service.id,
        staffId,
      }));
      await supabaseAdmin.from("StaffService").insert(staffAssignments);
    }

    // Re-fetch with assignments
    const { data: fullService } = await supabaseAdmin
      .from("Service")
      .select("*, category:ServiceCategory(name), assignedStaff:StaffService(staffId, staff:StaffMember(id, displayName, color))")
      .eq("id", service.id)
      .single();

    return NextResponse.json({ service: fullService || service }, { status: 201 });
  } catch (error) {
    console.error("Service creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du service" },
      { status: 500 }
    );
  }
}