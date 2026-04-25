import { db } from "@/lib/db";

/**
 * CMI (Centre Monétique Interbancaire) Payment Service for Morocco
 * 
 * CMI is the primary payment gateway in Morocco for card payments.
 * Documentation: https://www.cmi.ma
 * 
 * Alternative payment methods in Morocco:
 * - CMI (card payments)
 * - Cash (espèces)
 * - Bank transfer (virement bancaire)
 * - Check (chèque)
 * - Mobile payment (future)
 */

interface CreatePaymentParams {
  bookingId: string;
  amount: number;
  method: "CARD" | "CASH" | "CHECK" | "ONLINE" | "GIFT_CARD";
  tip?: number;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string; // For CMI redirect
}

/**
 * Initialize a CMI payment
 * 
 * CMI works via redirect:
 * 1. Create payment request
 * 2. Redirect user to CMI payment page
 * 3. CMI redirects back with result
 * 4. Verify and confirm payment
 */
export async function initCmiPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount, method } = params;

  if (method !== "CARD" && method !== "ONLINE") {
    return { success: false, error: "CMI only supports card/online payments" };
  }

  // Get booking details
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { salon: true, user: true },
  });

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  if (!booking.salon.stripeAccountId) {
    return { success: false, error: "Paiement en ligne non configuré pour ce salon" };
  }

  // Create payment record
  const payment = await db.payment.create({
    data: {
      bookingId,
      salonId: booking.salonId,
      userId: booking.userId,
      amount,
      tip: params.tip || 0,
      method,
      type: "BOOKING_DEPOSIT",
      status: "PENDING",
    },
  });

  // In production, this would call CMI API
  // For now, return a mock redirect URL
  // CMI API: https://tpeweb.cmi.ma:8443/pci?command=paiement
  const redirectUrl = `https://tpeweb.cmi.ma:8443/pci?command=paiement&merchant=${process.env.CMI_MERCHANT_ID}&reference=${payment.id}&montant=${amount}&devise=504`;

  return {
    success: true,
    paymentId: payment.id,
    redirectUrl,
  };
}

/**
 * Handle CMI callback/return
 */
export async function handleCmiCallback(params: {
  paymentId: string;
  status: string;
  hash: string;
}): Promise<PaymentResult> {
  const { paymentId, status, hash } = params;

  // Verify hash (CMI sends a signature)
  const expectedHash = generateCmiHash(paymentId, status);
  if (hash !== expectedHash) {
    return { success: false, error: "Signature invalide" };
  }

  // Find payment
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  // Update payment status
  const newStatus = status === "00" ? "SUCCEEDED" : "FAILED";
  await db.payment.update({
    where: { id: paymentId },
    data: { status: newStatus },
  });

  // Update booking if payment succeeded
  if (newStatus === "SUCCEEDED" && payment.booking && payment.bookingId) {
    await db.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
        depositPaid: true,
      },
    });
  }

  return { success: newStatus === "SUCCEEDED" };
}

/**
 * Process cash payment (in-salon)
 */
export async function processCashPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount } = params;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  const payment = await db.payment.create({
    data: {
      bookingId,
      salonId: booking.salonId,
      userId: booking.userId,
      amount,
      method: "CASH",
      type: "IN_SALON",
      status: "SUCCEEDED",
    },
  });

  // Update booking
  await db.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  return { success: true, paymentId: payment.id };
}

/**
 * Process check payment
 */
export async function processCheckPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { bookingId, amount } = params;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  const payment = await db.payment.create({
    data: {
      bookingId,
      salonId: booking.salonId,
      userId: booking.userId,
      amount,
      method: "CHECK",
      type: "IN_SALON",
      status: "PENDING", // Check needs to be deposited
    },
  });

  return { success: true, paymentId: payment.id };
}

/**
 * Generate CMI hash for callback verification
 */
function generateCmiHash(paymentId: string, status: string): string {
  // In production, this would use the CMI secret key
  // For now, return a mock hash
  return `hash-${paymentId}-${status}`;
}

/**
 * Process refund
 */
export async function processRefund(paymentId: string, amount?: number): Promise<PaymentResult> {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  if (payment.status !== "SUCCEEDED") {
    return { success: false, error: "Paiement non remboursable" };
  }

  // In production, call CMI refund API
  // For now, just update status
  const refundAmount = amount || payment.amount;
  
  await db.payment.create({
    data: {
      bookingId: payment.bookingId,
      salonId: payment.salonId,
      userId: payment.userId,
      amount: -refundAmount, // Negative for refund
      method: payment.method,
      type: "REFUND",
      status: "SUCCEEDED",
    },
  });

  return { success: true };
}
