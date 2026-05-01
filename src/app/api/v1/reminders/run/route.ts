import { NextResponse } from "next/server";
import { runBookingReminders } from "@/server/services/reminder.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/reminders/run
 *
 * Trigger booking reminders (24h and 1h before appointments).
 * Should be called by a cron job every hour.
 *
 * Requires AUTH_SECRET header for security.
 */
export async function POST(request: Request) {
  try {
    // Simple auth check
    const authSecret = request.headers.get("x-auth-secret");
    if (authSecret !== process.env.CRON_SECRET) {
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
# v2
