import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/v1/pro/photos — List salon photos
export async function GET(request: Request) {
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

    const { data: photos } = await supabaseAdmin
      .from("SalonPhoto")
      .select("*")
      .eq("salonId", salon.id)
      .order("order", { ascending: true });

    return NextResponse.json({ photos: photos || [] });
  } catch (error) {
    console.error("GET /api/v1/pro/photos error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/v1/pro/photos — Add a photo
export async function POST(request: Request) {
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
    const { url, alt } = body;

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    // Get max order
    const { data: maxOrderPhoto } = await supabaseAdmin
      .from("SalonPhoto")
      .select("order")
      .eq("salonId", salon.id)
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderPhoto?.order ?? -1) + 1;

    const { data: photo, error: createError } = await supabaseAdmin
      .from("SalonPhoto")
      .insert({
        salonId: salon.id,
        url,
        alt: alt || null,
        order: nextOrder,
      })
      .select()
      .single();

    if (createError) {
      console.error("Photo creation error:", createError);
      return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/pro/photos error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/v1/pro/photos — Delete a photo
export async function DELETE(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "ID photo requis" }, { status: 400 });
    }

    // Verify the photo belongs to the user's salon
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("SalonPhoto")
      .delete()
      .eq("id", photoId)
      .eq("salonId", salon.id);

    if (deleteError) {
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/pro/photos error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
