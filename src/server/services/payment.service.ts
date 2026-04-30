import { db } from "@/lib/db";
import { initDodoPayment, processCashPayment as processDodoCashPayment, processCheckPayment as processDodoCheckPayment, processRefund as processDodoRefund } from "./dodo-payment.service";

/**
 * Unified Payment Service for Morocco
 * 
 * Supports multiple payment gateways:
 * - Dodo Payment (primary, recommended)
 * - CMI (legacy, for compatibility)
 * - Cash/Check (in-salon)
 * 
 * Documentation:
 * - Dodo: https://docs.dodopayments.com
 * - CMI: https://www.cmi.ma
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
 * Initialize a payment (uses Dodo Payment by default)
 * 
 * For online payments, redirects to Dodo checkout.
 * For cash/check payments, creates local record.
 */
export async function initPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { method } = params;

  if (method === "CASH") {
    return processDodoCashPayment(params);
  }

  if (method === "CHECK") {
    return processDodoCheckPayment(params);
  }

  // Use Dodo Payment for online/card payments
  return initDodoPayment(params);
}

/**
 * Initialize a CMI payment (legacy, deprecated)
 * 
 * @deprecated Use initPayment() instead, which uses Dodo Payment
 */
export async function initCmiPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  // Redirect to Dodo payment for now
  return initPayment(params);
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
 * 
 * @deprecated Use initPayment() instead
 */
export async function processCashPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  return processDodoCashPayment(params);
}

/**
 * Process check payment
 * 
 * @deprecated Use initPayment() instead
 */
export async function processCheckPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  return processDodoCheckPayment(params);
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
 * 
 * @deprecated Use processRefund from dodo-payment.service directly
 */
export async function processRefund(paymentId: string, amount?: number): Promise<PaymentResult> {
  return processDodoRefund(paymentId, amount);
}
