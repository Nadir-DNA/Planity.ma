import { NextRequest, NextResponse } from "next/server";
import { handleDodoWebhook } from "@/server/services/dodo-payment.service";
import { createHmac } from "crypto";

/**
 * Dodo Payment Webhook Handler
 * 
 * This endpoint receives webhook events from Dodo Payment
 * and processes them accordingly.
 * 
 * Documentation: https://docs.dodopayments.com/developer-resources/webhooks
 * 
 * Dodo uses Standard Webhooks spec with HMAC SHA256 signatures.
 * The secret key is configured in .env as DODO_PAYMENTS_WEBHOOK_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

    // Verify webhook signature if a key is configured
    if (webhookKey) {
      const signature = request.headers.get("webhook-signature");
      const webhookId = request.headers.get("webhook-id");
      const webhookTimestamp = request.headers.get("webhook-timestamp");

      if (!signature || !webhookId || !webhookTimestamp) {
        console.warn("Dodo webhook missing security headers");
        return NextResponse.json({ error: "Missing webhook headers" }, { status: 401 });
      }

      // Reconstruct the signed content
      const rawBody = await request.clone().text();
      const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

      // Compute expected signature
      const expectedSig = createHmac("sha256", webhookKey)
        .update(signedContent)
        .digest("base64");

      // Signatures come as "v1=base64sig,v1=base64sig2..."
      const receivedSigs = signature.split(",").map(s => s.trim());
      const isValid = receivedSigs.some(sig => {
        const [version, sigValue] = sig.split("=");
        return version === "v1" && sigValue === expectedSig;
      });

      if (!isValid) {
        console.error("Dodo webhook: invalid signature");
        return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
      }
    }

    // Process the webhook
    const result = await handleDodoWebhook({
      event_type: payload.type || payload.event_type,
      data: payload.data || payload,
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
