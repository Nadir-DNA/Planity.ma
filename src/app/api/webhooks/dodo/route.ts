import { NextRequest, NextResponse } from "next/server";
import { handleDodoWebhook } from "@/server/services/dodo-payment.service";

/**
 * Dodo Payment Webhook Handler
 * 
 * This endpoint receives webhook events from Dodo Payment
 * and processes them accordingly.
 * 
 * Documentation: https://docs.dodopayments.com/developer-resources/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature (if Dodo provides one)
    // In production, you should verify the signature
    const signature = request.headers.get("x-dodo-signature");
    if (signature) {
      // TODO: Implement signature verification
      // const isValid = verifyDodoSignature(payload, signature, process.env.DODO_WEBHOOK_SECRET!);
      // if (!isValid) {
      //   return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
      // }
    }

    // Process the webhook
    const result = await handleDodoWebhook({
      event_type: payload.event_type,
      data: payload.data,
    });

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return NextResponse.json(
        { error: "Échec du traitement du webhook" },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Dodo webhook error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Dodo Payment webhook endpoint" },
    { status: 200 }
  );
}
