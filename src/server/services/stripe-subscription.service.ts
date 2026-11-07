import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin, findById, insertRow, updateRow } from "@/lib/supabase-helpers";
import { APP_NAME } from "@/lib/constants";

/**
 * Abonnement d'activation des salons via Stripe Checkout (mode subscription).
 *
 * Le salon paie en MAD, Stripe verse en EUR sur le compte (FR).
 * Le salon n'est activé que par le webhook signé, jamais par la page de retour.
 * Documentation : https://docs.stripe.com/billing/subscriptions/build-subscriptions
 */

const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
// Prix mensuel en dirhams (Stripe attend des centimes)
const SALON_PRICE_MAD = Number(process.env.SALON_SUBSCRIPTION_PRICE_MAD || 199);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

// Tolérance anti-replay recommandée par Stripe
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

interface SubscriptionResult {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, any> };
}

/**
 * Vérifie l'en-tête `Stripe-Signature` (t=...,v1=...) : HMAC SHA256 de `${t}.${rawBody}`.
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!header || !secret) return false;

  const parts = header.split(",").map((p) => p.trim().split("="));
  const timestamp = Number(parts.find(([k]) => k === "t")?.[1]);
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex"),
  );
  return signatures.some((sig) => {
    const received = Buffer.from(sig);
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

/**
 * Crée la session Stripe Checkout d'abonnement pour activer un salon.
 */
export async function initSalonSubscription(salonId: string): Promise<SubscriptionResult> {
  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY manquante dans l'environnement");
    return { success: false, error: "Paiement d'activation non configuré" };
  }

  const { data: salon, error: salonError } = await supabaseAdmin
    .from("Salon")
    .select("id, name, isActive, ownerId, owner:User!ownerId(id, email)")
    .eq("id", salonId)
    .single();

  if (salonError || !salon) {
    return { success: false, error: "Salon introuvable" };
  }
  if (salon.isActive) {
    return { success: false, error: "Ce salon est déjà actif" };
  }

  const owner = (Array.isArray(salon.owner) ? salon.owner[0] : salon.owner) as
    | { id: string; email: string | null }
    | undefined;

  // Réutiliser un paiement PENDING existant plutôt que d'en empiler
  const { data: pendingPayment } = await supabaseAdmin
    .from("Payment")
    .select("id")
    .eq("salonId", salonId)
    .eq("type", "SALON_SUBSCRIPTION")
    .eq("status", "PENDING")
    .maybeSingle();

  const payment = pendingPayment
    ? pendingPayment
    : await insertRow<{ id: string }>("Payment", {
        salonId,
        userId: salon.ownerId,
        amount: SALON_PRICE_MAD,
        method: "CARD",
        type: "SALON_SUBSCRIPTION",
        status: "PENDING",
      });

  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "mad",
    "line_items[0][price_data][unit_amount]": String(Math.round(SALON_PRICE_MAD * 100)),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][product_data][name]": `Abonnement salon ${APP_NAME}`,
    client_reference_id: salonId,
    "metadata[salon_id]": salonId,
    "metadata[payment_id]": payment.id,
    "subscription_data[metadata][salon_id]": salonId,
    success_url: `${APP_URL}/paiement/succes?type=activation`,
    cancel_url: `${APP_URL}/pro?paiement=annule`,
  });
  if (owner?.email) params.set("customer_email", owner.email);

  try {
    const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await response.json();
    if (!response.ok) {
      console.error("Stripe checkout error:", response.status, session?.error?.message);
      return { success: false, error: "Échec de la création du paiement d'abonnement" };
    }

    await updateRow("Payment", payment.id, {
      stripePaymentIntentId: session.id,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, paymentId: payment.id, redirectUrl: session.url };
  } catch (error) {
    console.error("Stripe checkout request failed:", error);
    return { success: false, error: "Échec de la création du paiement d'abonnement" };
  }
}

/**
 * Traite un événement Stripe déjà vérifié (signature + dédup faites par la route).
 */
export async function handleStripeEvent(event: StripeEvent): Promise<{ success: boolean; error?: string }> {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(obj);
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return handleSubscriptionChange(obj, event.type);
    default:
      return { success: true };
  }
}

async function handleCheckoutCompleted(session: Record<string, any>) {
  if (session.mode !== "subscription") return { success: true };

  const paymentId = session.metadata?.payment_id;
  if (!paymentId) return { success: false, error: "payment_id manquant" };

  const payment = await findById<Record<string, unknown>>("Payment", paymentId);
  if (!payment) return { success: false, error: "Paiement introuvable" };
  if (payment.status === "SUCCEEDED") return { success: true };

  await updateRow("Payment", paymentId, {
    status: "SUCCEEDED",
    stripePaymentIntentId: session.subscription || session.id,
    updatedAt: new Date().toISOString(),
  });

  // Salon lu depuis le Payment en DB, jamais depuis le payload
  await supabaseAdmin
    .from("Salon")
    .update({
      isActive: true,
      subscriptionStatus: "ACTIVE",
      // shortcut: colonne héritée de Dodo, contient l'id d'abonnement Stripe — renommer lors de la prochaine migration
      dodoSubscriptionId: session.subscription || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", payment.salonId as string);

  return { success: true };
}

// past_due reste actif : Stripe relance la carte avant de passer en unpaid/canceled
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
const STATUS_MAP: Record<string, string> = {
  active: "ACTIVE",
  trialing: "ACTIVE",
  past_due: "ACTIVE",
  unpaid: "FAILED",
  incomplete_expired: "EXPIRED",
  canceled: "CANCELLED",
};

async function handleSubscriptionChange(subscription: Record<string, any>, eventType: string) {
  const status = eventType === "customer.subscription.deleted" ? "canceled" : subscription.status;
  if (!(status in STATUS_MAP)) return { success: true }; // incomplete, paused : rien à faire

  const update = {
    isActive: ACTIVE_STATUSES.has(status),
    subscriptionStatus: STATUS_MAP[status],
    updatedAt: new Date().toISOString(),
  };

  const { data: bySub } = await supabaseAdmin
    .from("Salon")
    .update(update)
    .eq("dodoSubscriptionId", subscription.id)
    .select("id");

  // L'événement peut arriver avant checkout.session.completed : repli sur la metadata posée par nous
  if (!bySub?.length && subscription.metadata?.salon_id) {
    await supabaseAdmin
      .from("Salon")
      .update({ ...update, dodoSubscriptionId: subscription.id })
      .eq("id", subscription.metadata.salon_id);
  }

  return { success: true };
}
