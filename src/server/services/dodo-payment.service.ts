import { supabaseAdmin, findById, findByUnique, insertRow, updateRow } from "@/lib/supabase-helpers";

/**
 * Dodo Payment Service for Morocco
 * 
 * Dodo Payment is a payment gateway alternative to Stripe/CMI.
 * Documentation: https://docs.dodopayments.com
 * 
 * API Base URL: https://live.dodopayments.com (⚠️ PAS d' /v1/ dans les chemins)
 * Authentication: Bearer token via API key
 */

// DODO_API_MODE=test → environnement de test Dodo (clé + produits + webhook test requis)
const DODO_API_BASE =
  process.env.DODO_API_MODE === "test"
    ? "https://test.dodopayments.com"
    : "https://live.dodopayments.com";
const DODO_API_KEY = process.env.DODO_PAYMENT_API_KEY || "";
const DODO_WEBHOOK_KEY = process.env.DODO_PAYMENTS_WEBHOOK_KEY || "";
const DODO_BOOKING_PRODUCT_ID = process.env.DODO_BOOKING_PRODUCT_ID || "pdt_0Nep6iKfD7V6aEdluDCOE";
// Produit d'abonnement récurrent Dodo pour l'activation d'un salon
const DODO_SALON_SUBSCRIPTION_PRODUCT_ID = process.env.DODO_SALON_SUBSCRIPTION_PRODUCT_ID || "";

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Approximate MAD-to-USD rate for Dodo Payments (product prices are in USD)
// Dodo handles adaptive currency display via billing_currency field
const MAD_TO_USD_CENTS_RATE = 10; // ~10 MAD = 1 USD

interface CreatePaymentParams {
  bookingId: string;
  amount: number;
  method: "CARD" | "CASH" | "CHECK" | "ONLINE" | "GIFT_CARD";
  tip?: number;
  currency?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
  dodoPaymentId?: string;
}

interface DodoCheckoutSession {
  session_id: string;
  checkout_url: string | null;
}

/**
 * Create a Dodo Payment checkout session
 */
async function createDodoCheckoutSession(params: {
  bookingId: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  currency?: string;
  metadata?: Record<string, string>;
}): Promise<DodoCheckoutSession | null> {
  const { bookingId, amount, customerEmail, customerName, currency = "MAD", metadata = {} } = params;

  try {
    // Convert MAD amount to USD cents (Dodo products are priced in USD)
    const amountInUsdCents = Math.round((amount / MAD_TO_USD_CENTS_RATE) * 100);

    const response = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{
          product_id: DODO_BOOKING_PRODUCT_ID,
          quantity: 1,
          amount: amountInUsdCents,
        }],
        billing_currency: "MAD",
        metadata: {
          booking_id: bookingId,
          payment_type: "booking_deposit",
          ...metadata,
        },
        redirect_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/paiement/succes`,
        cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/paiement/annule`,
        ...(customerEmail ? {
          customer: {
            email: customerEmail,
            name: customerName || undefined,
          },
        } : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
      console.error("Dodo Payment API error:", error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Dodo Payment API request failed:", error);
    return null;
  }
}

/**
 * Initialize a Dodo Payment
 */
export async function initDodoPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount, method } = params;

  if (method !== "CARD" && method !== "ONLINE") {
    return { success: false, error: "Dodo Payment supporte uniquement les paiements en ligne" };
  }

  // Get booking details
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("Booking")
    .select("*, salon:Salon!salonId(*), user:User!userId(*)")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  // Create payment record
  const payment = await insertRow("Payment", {
    bookingId,
    salonId: booking.salonId,
    userId: booking.userId || null,
    amount,
    tip: params.tip || 0,
    method,
    type: "BOOKING_DEPOSIT",
    status: "PENDING",
  });

  const bookingData = booking as Record<string, unknown>;
  const userData = bookingData.user as Record<string, unknown> | undefined;

  // Create Dodo checkout session
  const checkoutSession = await createDodoCheckoutSession({
    bookingId,
    amount,
    currency: "MAD",
    customerEmail: userData?.email as string | undefined,
    customerName: userData?.name as string | undefined,
    metadata: {
      salon_id: booking.salonId,
      payment_id: (payment as Record<string, unknown>).id as string,
    },
  });

  if (!checkoutSession) {
    return { success: false, error: "Échec de la création du paiement Dodo" };
  }

  // Update payment with Dodo ID
  await updateRow("Payment", (payment as Record<string, unknown>).id as string, {
    stripePaymentIntentId: checkoutSession.session_id, // Dodo session ID
  });

  return {
    success: true,
    paymentId: (payment as Record<string, unknown>).id as string,
    redirectUrl: checkoutSession.checkout_url || undefined,
    dodoPaymentId: checkoutSession.session_id,
  };
}

/**
 * Init salon activation subscription (abonnement récurrent Dodo).
 * Le salon n'est activé que par le webhook (payment.succeeded / subscription.active).
 */
export async function initSalonSubscription(salonId: string): Promise<PaymentResult> {
  if (!DODO_SALON_SUBSCRIPTION_PRODUCT_ID) {
    console.error("DODO_SALON_SUBSCRIPTION_PRODUCT_ID manquant dans l'environnement");
    return { success: false, error: "Paiement d'activation non configuré" };
  }

  const { data: salon, error: salonError } = await supabaseAdmin
    .from("Salon")
    .select("id, name, isActive, ownerId, owner:User!ownerId(id, email, name)")
    .eq("id", salonId)
    .single();

  if (salonError || !salon) {
    return { success: false, error: "Salon introuvable" };
  }
  if (salon.isActive) {
    return { success: false, error: "Ce salon est déjà actif" };
  }

  const owner = (Array.isArray(salon.owner) ? salon.owner[0] : salon.owner) as
    | { id: string; email: string | null; name: string | null }
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
        amount: 0, // prix porté par le produit Dodo
        method: "CARD",
        type: "SALON_SUBSCRIPTION",
        status: "PENDING",
      });

  try {
    const response = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: DODO_SALON_SUBSCRIPTION_PRODUCT_ID, quantity: 1 }],
        metadata: {
          payment_type: "salon_subscription",
          salon_id: salonId,
          payment_id: payment.id,
        },
        redirect_url: `${APP_URL}/paiement/succes?type=activation`,
        cancel_url: `${APP_URL}/pro?paiement=annule`,
        ...(owner?.email
          ? { customer: { email: owner.email, name: owner.name || undefined } }
          : {}),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, unknown>));
      console.error("Dodo subscription checkout error:", response.status, err);
      if ((err as { code?: string }).code === "MERCHANT_NOT_LIVE") {
        return {
          success: false,
          error: "Le compte de paiement Planity est en cours de validation chez notre prestataire. Réessayez bientôt — votre salon est enregistré.",
        };
      }
      return { success: false, error: "Échec de la création du paiement d'abonnement" };
    }

    const session: DodoCheckoutSession = await response.json();

    await updateRow("Payment", payment.id, {
      stripePaymentIntentId: session.session_id,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      paymentId: payment.id,
      redirectUrl: session.checkout_url || undefined,
      dodoPaymentId: session.session_id,
    };
  } catch (error) {
    console.error("Dodo subscription request failed:", error);
    return { success: false, error: "Échec de la création du paiement d'abonnement" };
  }
}

/**
 * Handle Dodo Payment webhook
 */
export async function handleDodoWebhook(payload: {
  event_type: string;
  data: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  const { event_type, data } = payload;

  try {
    switch (event_type) {
      // Dodo émet "payment.succeeded" (spec actuelle) — "payment.success" conservé par compat
      case "payment.succeeded":
      case "payment.success":
        return await handlePaymentSuccess(data);
      case "payment.failed":
        return await handlePaymentFailed(data);
      case "payment.refunded":
      case "refund.succeeded":
        return await handlePaymentRefunded(data);
      case "subscription.active":
      case "subscription.renewed":
        return await handleSubscriptionActive(data);
      case "subscription.on_hold":
      case "subscription.failed":
      case "subscription.cancelled":
      case "subscription.expired":
        return await handleSubscriptionEnded(data, event_type);
      default:
        console.log(`Unhandled Dodo webhook event: ${event_type}`);
        return { success: true };
    }
  } catch (error) {
    console.error("Dodo webhook processing error:", error);
    return { success: false, error: "Erreur de traitement du webhook" };
  }
}

/** Active le salon lié à un paiement d'abonnement (id de salon lu en DB, pas depuis le payload). */
async function activateSalonForPayment(payment: Record<string, unknown>, data: Record<string, any>) {
  const salonId = payment.salonId as string | null;
  if (!salonId) return;

  await supabaseAdmin
    .from("Salon")
    .update({
      isActive: true,
      subscriptionStatus: "ACTIVE",
      dodoSubscriptionId: data.subscription_id || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", salonId);
}

async function handlePaymentSuccess(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const paymentId = data.metadata?.payment_id;

  if (!paymentId) {
    return { success: false, error: "Payment ID manquant" };
  }

  // Find payment
  const payment = await findById<Record<string, unknown>>("Payment", paymentId);

  if (!payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  // Idempotence : ne traiter qu'une fois
  if (payment.status === "SUCCEEDED") {
    return { success: true };
  }

  // Update payment status
  await updateRow("Payment", paymentId, {
    status: "SUCCEEDED",
    stripePaymentIntentId: data.payment_id || data.id || payment.stripePaymentIntentId,
    receiptUrl: data.receipt_url || payment.receiptUrl,
    updatedAt: new Date().toISOString(),
  });

  // Lier les effets au Payment vérifié en DB — jamais aux ids du payload
  if (payment.type === "SALON_SUBSCRIPTION") {
    await activateSalonForPayment(payment, data);
  } else if (payment.bookingId) {
    await updateRow("Booking", payment.bookingId as string, {
      status: "CONFIRMED",
      depositPaid: true,
    });
  }

  return { success: true };
}

async function handleSubscriptionActive(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const salonId = data.metadata?.salon_id;
  const subscriptionId = data.subscription_id || data.id;

  // Résolution : metadata (posée par nous au checkout, signature vérifiée) puis subscriptionId connu
  let targetSalonId: string | null = salonId || null;
  if (!targetSalonId && subscriptionId) {
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("dodoSubscriptionId", subscriptionId)
      .maybeSingle();
    targetSalonId = salon?.id || null;
  }

  if (!targetSalonId) {
    console.warn("subscription.active sans salon résolu:", subscriptionId);
    return { success: true };
  }

  await supabaseAdmin
    .from("Salon")
    .update({
      isActive: true,
      subscriptionStatus: "ACTIVE",
      dodoSubscriptionId: subscriptionId || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", targetSalonId);

  return { success: true };
}

async function handleSubscriptionEnded(data: Record<string, any>, eventType: string): Promise<{ success: boolean; error?: string }> {
  const subscriptionId = data.subscription_id || data.id;
  const salonIdFromMeta = data.metadata?.salon_id;

  const statusMap: Record<string, string> = {
    "subscription.cancelled": "CANCELLED",
    "subscription.expired": "EXPIRED",
    "subscription.failed": "FAILED",
    "subscription.on_hold": "FAILED",
  };

  let query = supabaseAdmin
    .from("Salon")
    .update({
      isActive: false,
      subscriptionStatus: statusMap[eventType] || "CANCELLED",
      updatedAt: new Date().toISOString(),
    });

  if (subscriptionId) {
    const { error } = await query.eq("dodoSubscriptionId", subscriptionId);
    if (error) console.error("Salon deactivation error:", error);
  } else if (salonIdFromMeta) {
    const { error } = await query.eq("id", salonIdFromMeta);
    if (error) console.error("Salon deactivation error:", error);
  } else {
    console.warn(`${eventType} sans identifiant de salon exploitable`);
  }

  return { success: true };
}

async function handlePaymentFailed(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const paymentId = data.metadata?.payment_id;

  if (!paymentId) {
    return { success: false, error: "Payment ID manquant" };
  }

  await updateRow("Payment", paymentId, { status: "FAILED" });

  return { success: true };
}

async function handlePaymentRefunded(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const paymentId = data.metadata?.payment_id;

  if (!paymentId) {
    return { success: false, error: "Payment ID manquant" };
  }

  // Create refund record
  const originalPayment = await findById("Payment", paymentId);

  if (!originalPayment) {
    return { success: false, error: "Paiement original introuvable" };
  }

  const p = originalPayment as Record<string, unknown>;

  await insertRow("Payment", {
    bookingId: p.bookingId as string | null,
    salonId: p.salonId as string,
    userId: p.userId as string | null,
    amount: -(p.amount as number),
    tip: 0,
    method: p.method as string,
    type: "REFUND",
    status: "SUCCEEDED",
  });

  // Update original payment
  await updateRow("Payment", paymentId, { status: "REFUNDED" });

  // Update booking
  if (p.bookingId) {
    await updateRow("Booking", p.bookingId as string, { status: "CANCELLED" });
  }

  return { success: true };
}

/**
 * Process cash payment (in-salon)
 */
export async function processCashPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount } = params;

  const booking = await findById("Booking", bookingId);

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  const payment = await insertRow("Payment", {
    bookingId,
    salonId: (booking as Record<string, unknown>).salonId as string,
    userId: (booking as Record<string, unknown>).userId as string || null,
    amount,
    method: "CASH",
    type: "IN_SALON",
    status: "SUCCEEDED",
  });

  // Update booking
  await updateRow("Booking", bookingId, { status: "COMPLETED" });

  return { success: true, paymentId: (payment as Record<string, unknown>).id as string };
}

/**
 * Process check payment
 */
export async function processCheckPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount } = params;

  const booking = await findById("Booking", bookingId);

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  const payment = await insertRow("Payment", {
    bookingId,
    salonId: (booking as Record<string, unknown>).salonId as string,
    userId: (booking as Record<string, unknown>).userId as string || null,
    amount,
    method: "CHECK",
    type: "IN_SALON",
    status: "PENDING",
  });

  return { success: true, paymentId: (payment as Record<string, unknown>).id as string };
}

/**
 * Process refund
 */
export async function processRefund(paymentId: string, amount?: number): Promise<PaymentResult> {
  const payment = await findById("Payment", paymentId);

  if (!payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  const p = payment as Record<string, unknown>;

  if (p.status !== "SUCCEEDED") {
    return { success: false, error: "Paiement non remboursable" };
  }

  const refundAmount = amount || (p.amount as number);

  // If it was a Dodo payment, try to refund via API
  if (p.stripePaymentIntentId && p.method === "CARD") {
    try {
      await fetch(`${DODO_API_BASE}/refunds`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id: p.stripePaymentIntentId as string,
          metadata: {
            reason: "Merchant initiated refund",
          },
        }),
      });
    } catch (error) {
      console.error("Dodo refund API error:", error);
      // Continue with local refund record even if API fails
    }
  }

  // Create refund record
  await insertRow("Payment", {
    bookingId: p.bookingId as string | null,
    salonId: p.salonId as string,
    userId: p.userId as string | null,
    amount: -refundAmount,
    method: p.method as string,
    type: "REFUND",
    status: "SUCCEEDED",
  });

  return { success: true };
}