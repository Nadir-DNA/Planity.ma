-- Salon activation via Dodo Payments subscription
-- 1) Payment: colonnes utilisées par dodo-payment.service mais absentes du schéma,
--    + support des paiements sans booking (activation salon)
ALTER TABLE "Payment" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "salonId" UUID REFERENCES "Salon"(id) ON DELETE CASCADE;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'BOOKING_DEPOSIT'; -- BOOKING_DEPOSIT | SALON_SUBSCRIPTION
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "tip" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT; -- réutilisé pour les ids Dodo (session/payment/subscription)
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "Payment_salonId_idx" ON "Payment"("salonId");
CREATE INDEX IF NOT EXISTS "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- 2) Salon: suivi de l'abonnement d'activation
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "dodoSubscriptionId" TEXT;
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT; -- PENDING | ACTIVE | CANCELLED | EXPIRED | FAILED

-- 3) Idempotence des webhooks Dodo (dédup par webhook-id, spec Standard Webhooks)
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  id TEXT PRIMARY KEY, -- header webhook-id
  provider TEXT NOT NULL DEFAULT 'dodo',
  "eventType" TEXT,
  "receivedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "WebhookEvent" ENABLE ROW LEVEL SECURITY;
