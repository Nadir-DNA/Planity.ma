import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { initDodoPayment } from "@/server/services/dodo-payment.service";

/**
 * Dodo Payment Initiation Endpoint
 * 
 * Creates a payment session via Dodo Payment for a booking.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, amount, method, tip } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "bookingId et amount requis" },
        { status: 400 }
      );
    }

    // Initialize Dodo payment
    const result = await initDodoPayment({
      bookingId,
      amount,
      method: method || "CARD",
      tip: tip || 0,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl,
      dodoPaymentId: result.dodoPaymentId,
    });
  } catch (error) {
    console.error("Dodo payment initiation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation du paiement" },
      { status: 500 }
    );
  }
}