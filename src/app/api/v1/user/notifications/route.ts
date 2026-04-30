import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_NOTIFICATION_KEYS = [
  "notifyBookingConfirmed",
  "notifyBookingReminder",
  "notifyMarketing",
] as const;

type NotificationKey = (typeof VALID_NOTIFICATION_KEYS)[number];

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    // Validate keys
    const updateData: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!VALID_NOTIFICATION_KEYS.includes(key as NotificationKey)) {
        return NextResponse.json(
          { error: `Clé de notification invalide : ${key}` },
          { status: 400 }
        );
      }
      if (typeof value !== "boolean") {
        return NextResponse.json(
          { error: `La valeur pour ${key} doit être un booléen` },
          { status: 400 }
        );
      }
      updateData[key] = value;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune préférence de notification fournie" },
        { status: 400 }
      );
    }

    const dbUser = await db.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        notifyBookingConfirmed: true,
        notifyBookingReminder: true,
        notifyMarketing: true,
      },
    });

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("[PATCH /api/v1/user/notifications]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}