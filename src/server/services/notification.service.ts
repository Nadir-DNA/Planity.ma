import { supabaseAdmin, insertRow, updateRow } from "@/lib/supabase-helpers";
import { Resend } from "resend";

// Initialize Resend (will be undefined in dev, but that's OK for now)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
  const notification = await insertRow("Notification", {
    userId: params.userId,
    type: params.type,
    channel: params.channel,
    title: params.title,
    body: params.body,
    data: params.data ? JSON.parse(JSON.stringify(params.data)) : null,
    status: "PENDING",
  });

  // Actually send via email/SMS/push based on channel
  try {
    if (params.channel === "EMAIL") {
      await sendEmailNotification(params);
    } else if (params.channel === "SMS") {
      // TODO: Integrate Twilio/Infobip for SMS
      console.log(`[SMS] Would send: ${params.body}`);
    } else if (params.channel === "PUSH") {
      // TODO: Integrate Firebase Cloud Messaging
      console.log(`[PUSH] Would send: ${params.title} - ${params.body}`);
    }

    await updateRow("Notification", (notification as Record<string, unknown>).id as string, {
      status: "SENT",
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to send ${params.channel} notification:`, error);
    await updateRow("Notification", (notification as Record<string, unknown>).id as string, {
      status: "FAILED",
    });
  }

  return notification;
}

async function sendEmailNotification(params: SendNotificationParams) {
  if (!resend) {
    console.log(`[EMAIL] Would send to user ${params.userId}: ${params.title}`);
    return;
  }

  // Fetch user email
  const { data: user } = await supabaseAdmin
    .from("User")
    .select("email, name")
    .eq("id", params.userId)
    .single();

  if (!user?.email) {
    console.warn(`No email for user ${params.userId}`);
    return;
  }

  await resend.emails.send({
    from: "Planity.ma <onboarding@resend.dev>",
    to: [user.email],
    subject: params.title,
    html: params.body, // TODO: Use proper HTML template
  });
}

export async function sendBookingConfirmation(bookingId: string) {
  const { data: booking, error } = await supabaseAdmin
    .from("Booking")
    .select(`
      *,
      user:User!userId(*),
      salon:Salon!salonId(*),
      items:BookingItem(*, service:Service!serviceId(*), staff:StaffMember!staffId(*))
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) return;

  const b = booking as Record<string, unknown>;
  const items = (b.items || []) as Record<string, unknown>[];
  const services = items.map((i) => (i.service as Record<string, unknown>)?.name ?? "").join(", ");
  const startTime = new Date(b.startTime as string);
  const dateStr = startTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Send email
  await createNotification({
    userId: b.userId as string,
    type: "BOOKING_CONFIRMED",
    channel: "EMAIL",
    title: "Réservation confirmée — Planity.ma",
    body: generateBookingConfirmationEmail({
      salonName: ((b.salon as Record<string, unknown>)?.name ?? "") as string,
      services,
      date: dateStr,
      time: timeStr,
      reference: b.reference as string,
      totalPrice: b.totalPrice as number,
    }),
    data: { bookingId, salonName: (b.salon as Record<string, unknown>)?.name },
  });

  // Also send SMS if user has phone
  const user = b.user as Record<string, unknown> | null;
  if (user?.phone) {
    await createNotification({
      userId: b.userId as string,
      type: "BOOKING_CONFIRMED",
      channel: "SMS",
      title: "RDV confirmé",
      body: `RDV ${(b.salon as Record<string, unknown>)?.name} le ${dateStr} à ${timeStr}. Ref: ${b.reference}`,
      data: { bookingId },
    });
  }
}

export async function sendBookingReminder(bookingId: string) {
  const { data: booking, error } = await supabaseAdmin
    .from("Booking")
    .select(`*, user:User!userId(*), salon:Salon!salonId(*)`)
    .eq("id", bookingId)
    .single();

  if (error || !booking) return;

  const b = booking as Record<string, unknown>;
  if (b.status !== "CONFIRMED") return;

  const startTime = new Date(b.startTime as string);
  const timeStr = startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: b.userId as string,
    type: "BOOKING_REMINDER",
    channel: "SMS",
    title: "Rappel de rendez-vous",
    body: `Rappel: votre rendez-vous chez ${(b.salon as Record<string, unknown>)?.name} est aujourd'hui à ${timeStr}. Ref: ${b.reference}`,
    data: { bookingId },
  });
}

export async function sendBookingCancellation(bookingId: string) {
  const { data: booking, error } = await supabaseAdmin
    .from("Booking")
    .select(`
      *,
      user:User!userId(*),
      salon:Salon!salonId(*),
      items:BookingItem(*, service:Service!serviceId(*))
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) return;

  const b = booking as Record<string, unknown>;
  const items = (b.items || []) as Record<string, unknown>[];
  const services = items.map((i) => (i.service as Record<string, unknown>)?.name ?? "").join(", ");
  const startTime = new Date(b.startTime as string);
  const dateStr = startTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: b.userId as string,
    type: "BOOKING_CANCELLED",
    channel: "EMAIL",
    title: "Réservation annulée — Planity.ma",
    body: generateBookingCancellationEmail({
      salonName: ((b.salon as Record<string, unknown>)?.name ?? "") as string,
      services,
      date: dateStr,
      time: timeStr,
      reference: b.reference as string,
      reason: b.cancellationReason as string | null | undefined,
    }),
    data: { bookingId },
  });
}

// ============================================================
// EMAIL TEMPLATES (HTML)
// ============================================================

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
<head>
  <meta charset="utf-8">
  <title>Réservation confirmée</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">Réservation confirmée ✓</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                Votre rendez-vous chez <strong>${params.salonName}</strong> est confirmé.
              </p>
              
              <!-- Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Services</span><br>
                    <span style="font-weight: 500; color: #111827;">${params.services}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Date & Heure</span><br>
                    <span style="font-weight: 500; color: #111827;">${params.date} à ${params.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Référence</span><br>
                    <span style="font-weight: 500; color: #111827; font-family: monospace;">${params.reference}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px;">
                    <span style="color: #6b7280; font-size: 14px;">Total</span><br>
                    <span style="font-weight: 700; color: #e11d48; font-size: 18px;">${params.totalPrice} DH</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Un rappel vous sera envoyé 24h avant votre rendez-vous.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Planity.ma — Votre plateforme de réservation beauté & bien-être
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
<head>
  <meta charset="utf-8">
  <title>Réservation annulée</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">Réservation annulée</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                Votre rendez-vous chez <strong>${params.salonName}</strong> a été annulé.
              </p>
              
              <!-- Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Services</span><br>
                    <span style="font-weight: 500; color: #111827;">${params.services}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Date & Heure</span><br>
                    <span style="font-weight: 500; color: #111827;">${params.date} à ${params.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Référence</span><br>
                    <span style="font-weight: 500; color: #111827; font-family: monospace;">${params.reference}</span>
                  </td>
                </tr>
                ${params.reason ? `
                <tr>
                  <td style="padding: 12px 16px;">
                    <span style="color: #6b7280; font-size: 14px;">Motif</span><br>
                    <span style="font-weight: 500; color: #111827;">${params.reason}</span>
                  </td>
                </tr>
                ` : ""}
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Vous pouvez réserver un nouveau rendez-vous à tout moment sur <a href="https://www.planity.ma" style="color: #e11d48;">Planity.ma</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Planity.ma — Votre plateforme de réservation beauté & bien-être
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}