import { db } from "@/lib/db";
import { sendBookingReminder } from "@/server/services/notification.service";

/**
 * Check for upcoming bookings and send reminders.
 *
 * Run this as a cron job every hour:
 * - 24h before: Send email + SMS reminder
 * - 1h before: Send SMS reminder
 */
export async function runBookingReminders() {
  const now = new Date();

  // Bookings starting in ~24 hours (23-25h window)
  const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Bookings starting in ~1 hour (0-2h window)
  const reminder1hStart = new Date(now.getTime() + 0 * 60 * 60 * 1000);
  const reminder1hEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Find bookings needing 24h reminder
  const bookings24h = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: { gte: reminder24hStart, lte: reminder24hEnd },
      reminder24hSent: false,
    },
    include: { user: true, salon: true },
  });

  // Find bookings needing 1h reminder
  const bookings1h = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: { gte: reminder1hStart, lte: reminder1hEnd },
      reminder1hSent: false,
    },
    include: { user: true, salon: true },
  });

  console.log(`[Reminders] Found ${bookings24h.length} bookings for 24h reminder`);
  console.log(`[Reminders] Found ${bookings1h.length} bookings for 1h reminder`);

  // Send 24h reminders
  for (const booking of bookings24h) {
    try {
      await sendBookingReminder(booking.id);
      await db.booking.update({
        where: { id: booking.id },
        data: { reminder24hSent: true },
      });
      console.log(`[Reminders] Sent 24h reminder for booking ${booking.reference}`);
    } catch (error) {
      console.error(`[Reminders] Failed to send 24h reminder for ${booking.reference}:`, error);
    }
  }

  // Send 1h reminders
  for (const booking of bookings1h) {
    try {
      await sendBookingReminder(booking.id);
      await db.booking.update({
        where: { id: booking.id },
        data: { reminder1hSent: true },
      });
      console.log(`[Reminders] Sent 1h reminder for booking ${booking.reference}`);
    } catch (error) {
      console.error(`[Reminders] Failed to send 1h reminder for ${booking.reference}:`, error);
    }
  }

  return {
    reminders24h: bookings24h.length,
    reminders1h: bookings1h.length,
  };
}
