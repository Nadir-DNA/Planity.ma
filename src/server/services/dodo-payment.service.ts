import { supabaseAdmin, findById, findByUnique, insertRow, updateRow } from "@/lib/supabase-helpers";

/**
 * Dodo Payment Service for Morocco
 * 
 * Dodo Payment is a payment gateway alternative to Stripe/CMI.
 * Documentation: https://docs.dodopayments.com
 * 
 * API Base URL: https://api.dodopayments.com
 * Authentication: Bearer token via API key
 */

const DODO_API_BASE = "https://api.dodopayments.com";
const DODO_API_KEY = process.env.DODO_API_KEY || "";

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
  id: string;
  status: string;
  checkout_url: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
}

/**
 * Create a Dodo Payment checkout session
 */
async function createDodoCheckoutSession(params: {
  bookingId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}): Promise<DodoCheckoutSession | null> {
  const { bookingId, amount, currency = "MAD", metadata = {} } = params;

  try {
    const response = await fetch(`${DODO_API_BASE}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
        "Dodo-Source": "planity.ma",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          booking_id: bookingId,
          source: "planity.ma",
          ...metadata,
        },
        redirect_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/paiement/succes`,
        cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/paiement/annule`,
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

  // Create Dodo checkout session
  const checkoutSession = await createDodoCheckoutSession({
    bookingId,
    amount,
    currency: "MAD",
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
    stripePaymentIntentId: checkoutSession.id, // Reuse existing field for Dodo payment ID
  });

  return {
    success: true,
    paymentId: (payment as Record<string, unknown>).id as string,
    redirectUrl: checkoutSession.checkout_url,
    dodoPaymentId: checkoutSession.id,
  };
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
      case "payment.success":
        return await handlePaymentSuccess(data);
      case "payment.failed":
        return await handlePaymentFailed(data);
      case "payment.refunded":
        return await handlePaymentRefunded(data);
      default:
        console.log(`Unhandled Dodo webhook event: ${event_type}`);
        return { success: true };
    }
  } catch (error) {
    console.error("Dodo webhook processing error:", error);
    return { success: false, error: "Erreur de traitement du webhook" };
  }
}

async function handlePaymentSuccess(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const paymentId = data.metadata?.payment_id;
  const bookingId = data.metadata?.booking_id;

  if (!paymentId) {
    return { success: false, error: "Payment ID manquant" };
  }

  // Find payment
  const payment = await findById("Payment", paymentId);

  if (!payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  // Update payment status
  await updateRow("Payment", paymentId, {
    status: "SUCCEEDED",
    stripePaymentIntentId: data.id || (payment as Record<string, unknown>).stripePaymentIntentId,
    receiptUrl: data.receipt_url || (payment as Record<string, unknown>).receiptUrl,
  });

  // Update booking if payment succeeded
  if (bookingId && (payment as Record<string, unknown>).bookingId) {
    await updateRow("Booking", bookingId, {
      status: "CONFIRMED",
      depositPaid: true,
    });
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
      await fetch(`${DODO_API_BASE}/v1/payments/${p.stripePaymentIntentId}/refund`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(refundAmount * 100),
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