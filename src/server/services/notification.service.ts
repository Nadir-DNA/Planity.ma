import { db } from "@/lib/db";

type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_REMINDER"
  | "BOOKING_CANCELLED"
  | "REVIEW_REQUEST"
  | "NEW_REVIEW"
  | "MARKETING"
  | "SYSTEM";

type NotificationChannel = "EMAIL" | "SMS" | "PUSH";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function createNotification(params: SendNotificationParams) {
  const notification = await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      channel: params.channel,
      title: params.title,
      body: params.body,
      data: params.data ? JSON.parse(JSON.stringify(params.data)) : undefined,
      status: "PENDING",
    },
  });

  // TODO: Actually send via email/SMS/push based on channel
  // For now, just mark as sent
  await db.notification.update({
    where: { id: notification.id },
    data: { status: "SENT", sentAt: new Date() },
  });

  return notification;
}

export async function sendBookingConfirmation(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      salon: true,
      items: { include: { service: true, staff: true } },
    },
  });

  if (!booking) return;

  const services = booking.items.map((i) => i.service.name).join(", ");
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
    type: "BOOKING_CONFIRMED",
    channel: "EMAIL",
    title: "Reservation confirmee",
    body: `Votre rendez-vous chez ${booking.salon.name} pour ${services} est confirme le ${dateStr} a ${timeStr}. Reference: ${booking.reference}`,
    data: { bookingId, salonName: booking.salon.name },
  });

  // Also send SMS if user has phone
  if (booking.user.phone) {
    await createNotification({
      userId: booking.userId,
      type: "BOOKING_CONFIRMED",
      channel: "SMS",
      title: "RDV confirme",
      body: `RDV ${booking.salon.name} le ${dateStr} a ${timeStr}. Ref: ${booking.reference}`,
      data: { bookingId },
    });
  }
}

export async function sendBookingReminder(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, salon: true },
  });

  if (!booking || booking.status !== "CONFIRMED") return;

  const timeStr = booking.startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: booking.userId,
    type: "BOOKING_REMINDER",
    channel: "SMS",
    title: "Rappel de rendez-vous",
    body: `Rappel: votre rendez-vous chez ${booking.salon.name} est aujourd'hui a ${timeStr}. Ref: ${booking.reference}`,
    data: { bookingId },
  });
}
