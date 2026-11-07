import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  handleStripeEvent,
  verifyStripeSignature,
  type StripeEvent,
} from "@/server/services/stripe-subscription.service";

/**
 * Webhook Stripe : active / désactive les salons selon leur abonnement.
 * Événements à cocher dans Stripe : checkout.session.completed,
 * customer.subscription.updated, customer.subscription.deleted.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Jamais de traitement sans vérification de signature
    console.error("STRIPE_WEBHOOK_SECRET non configurée — webhook refusé");
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  // Lire le body brut UNE seule fois, vérifier, puis parser
  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;

  // Idempotence : dédupliquer par id d'événement Stripe
  const { error: dedupeError } = await supabaseAdmin
    .from("WebhookEvent")
    .insert({ id: event.id, provider: "stripe", eventType: event.type });

  if (dedupeError) {
    if (dedupeError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("WebhookEvent dedupe error:", dedupeError.message);
  }

  try {
    const result = await handleStripeEvent(event);
    if (!result.success) throw new Error(result.error);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    // Libérer l'id pour que le retry Stripe puisse retraiter l'événement
    await supabaseAdmin.from("WebhookEvent").delete().eq("id", event.id);
    return NextResponse.json({ error: "Échec du traitement du webhook" }, { status: 500 });
  }
}
