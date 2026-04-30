import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, locale } = body;

    // Validate
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }
    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }
    if (locale !== undefined && !["FR", "AR"].includes(locale)) {
      return NextResponse.json({ error: "Locale invalide" }, { status: 400 });
    }

    if (phone !== undefined && phone !== null) {
      // Accept Moroccan format: 06XXXXXXXX or +212XXXXXXXXX
      const digits = phone.replace(/[^\d+]/g, "");
      const isMoroccan =
        /^06\d{8}$/.test(digits) || /^\+2126\d{8}$/.test(digits) || /^2126\d{8}$/.test(digits);
      if (!isMoroccan) {
        return NextResponse.json(
          { error: "Numéro invalide. Format : 06XXXXXXXX ou +212 6XXXXXXXX" },
          { status: 400 }
        );
      }
    }

    // Check phone uniqueness if changed
    if (phone !== undefined && phone !== null) {
      const { data: existing } = await supabaseAdmin
        .from("User")
        .select("id")
        .eq("phone", phone)
        .neq("id", authUser.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "Ce numéro de téléphone est déjà utilisé" },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (locale !== undefined) updateData.locale = locale;

    const { data: user, error: updateError } = await supabaseAdmin
      .from("User")
      .update(updateData)
      .eq("id", authUser.id)
      .select("id, name, email, phone, locale, notifyBookingConfirmed, notifyBookingReminder, notifyMarketing")
      .single();

    if (updateError) {
      console.error("[PATCH /api/v1/user/profile] Supabase error:", updateError);
      return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PATCH /api/v1/user/profile]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: dbUser, error } = await supabaseAdmin
      .from("User")
      .select("id, name, email, phone, locale, notifyBookingConfirmed, notifyBookingReminder, notifyMarketing")
      .eq("id", authUser.id)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("[GET /api/v1/user/profile]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}