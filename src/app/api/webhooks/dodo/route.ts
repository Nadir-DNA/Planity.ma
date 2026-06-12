import { NextRequest, NextResponse } from "next/server";
import { handleDodoWebhook } from "@/server/services/dodo-payment.service";
import { supabaseAdmin } from "@/lib/supabase";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Dodo Payment Webhook Handler
 *
 * Dodo suit la spec Standard Webhooks : signature HMAC SHA256 de
 * `${webhook-id}.${webhook-timestamp}.${rawBody}` avec la clé
 * DODO_PAYMENTS_WEBHOOK_KEY (obligatoire : ce webhook active des salons payants).
 *
 * Documentation: https://docs.dodopayments.com/developer-resources/webhooks
 */

// Tolérance sur l'horodatage pour bloquer les replays (spec: 5 minutes)
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!webhookKey) {
      // Jamais de traitement sans vérification de signature
      console.error("DODO_PAYMENTS_WEBHOOK_KEY non configurée — webhook refusé");
      return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
    }

    const signature = request.headers.get("webhook-signature");
    const webhookId = request.headers.get("webhook-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp");

    if (!signature || !webhookId || !webhookTimestamp) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 401 });
    }

    // Fenêtre temporelle anti-replay
    const timestampSec = parseInt(webhookTimestamp, 10);
    if (
      !Number.isFinite(timestampSec) ||
      Math.abs(Date.now() / 1000 - timestampSec) > TIMESTAMP_TOLERANCE_SECONDS
    ) {
      return NextResponse.json({ error: "Timestamp hors fenêtre" }, { status: 401 });
    }

    // Lire le body brut UNE seule fois, vérifier, puis parser
    const rawBody = await request.text();
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    // La clé Standard Webhooks est fournie en base64, préfixée "whsec_"
    const secretBytes = webhookKey.startsWith("whsec_")
      ? Buffer.from(webhookKey.slice(6), "base64")
      : Buffer.from(webhookKey, "utf8");

    const expectedSig = createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    // Signatures au format "v1,<base64> v1,<base64>..." (espace) ou "v1=<base64>,..." selon versions
    const receivedSigs = signature.split(/[ ,]/).map((s) => s.trim()).filter(Boolean);
    const isValid = receivedSigs.some((sig) => {
      const value = sig.startsWith("v1=") ? sig.slice(3) : sig.startsWith("v1,") ? sig.slice(3) : sig;
      return safeEqual(value, expectedSig);
    });

    if (!isValid) {
      console.error("Dodo webhook: invalid signature");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event_type;

    // Idempotence : dédupliquer par webhook-id (contrainte PK)
    const { error: dedupeError } = await supabaseAdmin
      .from("WebhookEvent")
      .insert({ id: webhookId, provider: "dodo", eventType });

    if (dedupeError) {
      if (dedupeError.code === "23505") {
        // Déjà traité — répondre 200 pour stopper les retries Dodo
        return NextResponse.json({ received: true, duplicate: true });
      }
      // Table absente ou erreur DB : on loggue mais on ne bloque pas le paiement
      console.error("WebhookEvent dedupe error:", dedupeError.message);
    }

    // Process the webhook
    const result = await handleDodoWebhook({
      event_type: eventType,
      data: payload.data || payload,
    });

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      // Libérer le webhook-id pour que le retry Dodo puisse retraiter l'événement
      await supabaseAdmin.from("WebhookEvent").delete().eq("id", webhookId);
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
