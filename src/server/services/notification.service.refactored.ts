/**
 * Notification Service - Refactored with DI
 */

import type { Notification, Booking, User } from "@prisma/client";
import type { INotificationRepository, IUserRepository, IBookingRepository } from "@/repositories/interfaces";

// ============================================
// Types
// ============================================

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_REMINDER"
  | "BOOKING_CANCELLED"
  | "REVIEW_REQUEST"
  | "NEW_REVIEW"
  | "MARKETING"
  | "SYSTEM";

export type NotificationChannel = "EMAIL" | "SMS" | "PUSH";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface EmailSender {
  send(params: { to: string[]; subject: string; html: string }): Promise<void>;
}

interface SMSSender {
  send(params: { to: string; body: string }): Promise<void>;
}

// ============================================
// Factory Function (DI Pattern)
// ============================================

interface NotificationServiceDeps {
  notificationRepo: INotificationRepository;
  userRepo: IUserRepository;
  bookingRepo: IBookingRepository;
  emailSender?: EmailSender;
  smsSender?: SMSSender;
}

export function createNotificationService(deps: NotificationServiceDeps) {
  const { notificationRepo, userRepo, bookingRepo, emailSender, smsSender } = deps;

  async function createNotification(params: SendNotificationParams): Promise<Notification> {
    const notification = await notificationRepo.create({
      userId: params.userId,
      type: params.type,
      channel: params.channel,
      title: params.title,
      body: params.body,
      data: params.data,
      status: "PENDING",
    });

    try {
      if (params.channel === "EMAIL") {
        await sendEmail(params);
      } else if (params.channel === "SMS" && smsSender) {
        await sendSMS(params);
      }

      await notificationRepo.updateStatus(notification.id, "SENT", new Date());
    } catch (error) {
      console.error(`Failed to send ${params.channel} notification:`, error);
      await notificationRepo.updateStatus(notification.id, "FAILED");
    }

    return notification;
  }

  async function sendEmail(params: SendNotificationParams): Promise<void> {
    if (!emailSender) {
      console.log(`[EMAIL] Would send to user ${params.userId}: ${params.title}`);
      return;
    }

    const user = await userRepo.findById(params.userId);
    if (!user?.email) {
      console.warn(`No email for user ${params.userId}`);
      return;
    }

    await emailSender.send({
      to: [user.email],
      subject: params.title,
      html: params.body,
    });
  }

  async function sendSMS(params: SendNotificationParams): Promise<void> {
    if (!smsSender) {
      console.log(`[SMS] Would send: ${params.body}`);
      return;
    }

    const user = await userRepo.findById(params.userId);
    if (!user?.phone) {
      console.warn(`No phone for user ${params.userId}`);
      return;
    }

    await smsSender.send({
      to: user.phone,
      body: params.body,
    });
  }

  async function sendBookingConfirmation(bookingId: string): Promise<void> {
    // Fetch booking with details via repository
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) return;

    // Get full booking details for email
    const user = await userRepo.findById(booking.userId);
    
    const dateStr = booking.startTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = booking.startTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send email
    await createNotification({
      userId: booking.userId,
      type: "BOOKING_CONFIRMED",
      channel: "EMAIL",
      title: "Réservation confirmée — Planity.ma",
      body: generateBookingConfirmationEmail({
        salonName: booking.salonId, // Will be replaced with actual salon name
        services: "Services",
        date: dateStr,
        time: timeStr,
        reference: booking.reference,
        totalPrice: booking.totalPrice,
      }),
      data: { bookingId },
    });

    // Send SMS if user has phone
    if (user?.phone) {
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_CONFIRMED",
        channel: "SMS",
        title: "RDV confirmé",
        body: `RDV confirmé le ${dateStr} à ${timeStr}. Ref: ${booking.reference}`,
        data: { bookingId },
      });
    }
  }

  async function sendBookingReminder(bookingId: string): Promise<void> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking || booking.status !== "CONFIRMED") return;

    const user = await userRepo.findById(booking.userId);
    
    const timeStr = booking.startTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await createNotification({
      userId: booking.userId,
      type: "BOOKING_REMINDER",
      channel: "SMS",
      title: "Rappel de rendez-vous",
      body: `Rappel: votre rendez-vous est aujourd'hui à ${timeStr}. Ref: ${booking.reference}`,
      data: { bookingId },
    });
  }

  async function sendBookingCancellation(bookingId: string): Promise<void> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) return;

    const dateStr = booking.startTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = booking.startTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await createNotification({
      userId: booking.userId,
      type: "BOOKING_CANCELLED",
      channel: "EMAIL",
      title: "Réservation annulée — Planity.ma",
      body: generateBookingCancellationEmail({
        salonName: "Salon",
        services: "Services",
        date: dateStr,
        time: timeStr,
        reference: booking.reference,
        reason: booking.cancellationReason,
      }),
      data: { bookingId },
    });
  }

  return {
    createNotification,
    sendBookingConfirmation,
    sendBookingReminder,
    sendBookingCancellation,
  };
}

// ============================================
// Email Templates
// ============================================

function generateBookingConfirmationEmail(params: {
  salonName: string;
  services: string;
  date: string;
  time: string;
  reference: string;
  totalPrice: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px;">
    <div style="background: #e11d48; padding: 32px; text-align: center; color: white;">
      <h1 style="margin: 0;">Réservation confirmée ✓</h1>
    </div>
    <div style="padding: 32px;">
      <p>Votre rendez-vous chez <strong>${params.salonName}</strong> est confirmé.</p>
      <p><strong>Date:</strong> ${params.date} à ${params.time}</p>
      <p><strong>Services:</strong> ${params.services}</p>
      <p><strong>Référence:</strong> ${params.reference}</p>
      <p><strong>Total:</strong> ${params.totalPrice} DH</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateBookingCancellationEmail(params: {
  salonName: string;
  services: string;
  date: string;
  time: string;
  reference: string;
  reason?: string | null;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px;">
    <div style="background: #6b7280; padding: 32px; text-align: center; color: white;">
      <h1 style="margin: 0;">Réservation annulée</h1>
    </div>
    <div style="padding: 32px;">
      <p>Votre rendez-vous a été annulé.</p>
      <p><strong>Date:</strong> ${params.date} à ${params.time}</p>
      <p><strong>Référence:</strong> ${params.reference}</p>
      ${params.reason ? `<p><strong>Motif:</strong> ${params.reason}</p>` : ""}
    </div>
  </div>
</body>
</html>
  `.trim();
}

export type NotificationService = ReturnType<typeof createNotificationService>;
