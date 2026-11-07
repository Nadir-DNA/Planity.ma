-- Aligne la base de prod sur ce que le code lit/écrit (écarts relevés le 07/11/2026).
-- Uniquement des ajouts : aucune colonne ni donnée supprimée.

-- Booking : annulation (PATCH /bookings/[id] plantait), acompte, rappels 24h/1h
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledBy" UUID;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "depositPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reminder24hSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reminder1hSent" BOOLEAN NOT NULL DEFAULT false;

-- User : vérification d'email (/api/v1/auth/verify-email)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationTokenExpires" TIMESTAMPTZ;

-- Ids TEXT sans valeur par défaut : tout insert sans id échouait.
-- Notification en premier : son échec empêchait l'envoi de TOUS les emails (confirmation, annulation, rappel).
-- WebhookEvent exclu : son id est l'id de l'événement fourni par le prestataire (dédup).
ALTER TABLE "Notification"       ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Favorite"           ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Product"            ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Supplier"           ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "OpeningHours"       ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "GiftCard"           ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "GiftCardUsage"      ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "LoyaltyCard"        ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "LoyaltyTransaction" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "MarketingCampaign"  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "StaffAbsence"       ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "ClockEvent"         ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Account"            ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Session"            ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

NOTIFY pgrst, 'reload schema';
