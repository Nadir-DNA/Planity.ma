import { NextResponse } from "next/server";
import { runBookingReminders } from "@/server/services/reminder.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/reminders/run
 *
 * Trigger booking reminders (24h and 1h before appointments).
 * Should be called by a cron job every hour.
 *
 * Requires x-auth-secret header matching CRON_SECRET or AUTH_SECRET.
 */
export async function POST(request: Request) {
  try {
    const authSecret = request.headers.get("x-auth-secret");
    const validSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET;
    if (authSecret !== validSecret) {
      return NextResponse.json(
        { error: "Non autorise" },
        { status: 401 }
      );
    }

    const results = await runBookingReminders();

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels" },
      { status: 500 }
    );
  }
}