import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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
      const existing = await db.user.findFirst({
        where: {
          phone: phone,
          NOT: { id: session.user.id },
        },
      });
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

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        locale: true,
        notifyBookingConfirmed: true,
        notifyBookingReminder: true,
        notifyMarketing: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PATCH /api/v1/user/profile]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        locale: true,
        notifyBookingConfirmed: true,
        notifyBookingReminder: true,
        notifyMarketing: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/v1/user/profile]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}