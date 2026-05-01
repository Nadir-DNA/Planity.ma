import { supabaseAdmin, updateRow, findMany } from "@/lib/supabase-helpers";
import { sendBookingReminder } from "@/server/services/notification.service";

/**
 * Check for upcoming bookings and send email reminders.
 *
 * Run this as a cron job every hour:
 * - 24h before: Send email reminder (isUrgent=false)
 * - 1h before: Send email reminder (isUrgent=true)
 */
export async function runBookingReminders() {
  const now = new Date();

  // Bookings starting in ~24 hours (23-25h window)
  const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Bookings starting in ~1 hour (0-2h window)
  const reminder1hStart = new Date(now.getTime() + 0 * 60 * 60 * 1000);
  const reminder1hEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Find bookings needing 24h reminder (email)
  const { data: bookings24h, error: err24h } = await supabaseAdmin
    .from("Booking")
    .select("*, user:User!userId(*), salon:Salon!salonId(*)")
    .eq("status", "CONFIRMED")
    .gte("startTime", reminder24hStart.toISOString())
    .lte("startTime", reminder24hEnd.toISOString())
    .eq("reminder24hSent", false);

  if (err24h) console.error("[Reminders] Error fetching 24h bookings:", err24h);

  // Find bookings needing 1h reminder (email)
  const { data: bookings1h, error: err1h } = await supabaseAdmin
    .from("Booking")
    .select("*, user:User!userId(*), salon:Salon!salonId(*)")
    .eq("status", "CONFIRMED")
    .gte("startTime", reminder1hStart.toISOString())
    .lte("startTime", reminder1hEnd.toISOString())
    .eq("reminder1hSent", false);

  if (err1h) console.error("[Reminders] Error fetching 1h bookings:", err1h);

  const b24 = bookings24h || [];
  const b1 = bookings1h || [];

  console.log(`[Reminders] Found ${b24.length} bookings for 24h email reminder`);
  console.log(`[Reminders] Found ${b1.length} bookings for 1h email reminder`);

  // Send 24h email reminders
  for (const booking of b24) {
    try {
      await sendBookingReminder(booking.id, false);
      await updateRow("Booking", booking.id, { reminder24hSent: true });
      console.log(`[Reminders] Sent 24h email for booking ${booking.reference}`);
    } catch (error) {
      console.error(`[Reminders] Failed 24h email for ${booking.reference}:`, error);
    }
  }

  // Send 1h email reminders
  for (const booking of b1) {
    try {
      await sendBookingReminder(booking.id, true);
      await updateRow("Booking", booking.id, { reminder1hSent: true });
      console.log(`[Reminders] Sent 1h email for booking ${booking.reference}`);
    } catch (error) {
      console.error(`[Reminders] Failed 1h email for ${booking.reference}:`, error);
    }
  }

  return {
    reminders24h: b24.length,
    reminders1h: b1.length,
  };
}