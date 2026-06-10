-- ============================================================
-- Planity.ma — Complete schema migration
-- Creates all tables required by the application.
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- User table (create if missing, add missing columns if exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  name TEXT,
  phone TEXT,
  "passwordHash" TEXT,
  role TEXT NOT NULL DEFAULT 'CONSUMER',
  locale TEXT NOT NULL DEFAULT 'FR',
  avatar TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns if User already exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'CONSUMER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'FR';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================
-- Salon
-- ============================================================
CREATE TABLE IF NOT EXISTS "Salon" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  "postalCode" TEXT,
  phone TEXT,
  email TEXT,
  "coverImage" TEXT,
  "ownerId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salon_owner ON "Salon"("ownerId");
CREATE INDEX IF NOT EXISTS idx_salon_slug ON "Salon"(slug);
CREATE INDEX IF NOT EXISTS idx_salon_city ON "Salon"(city);
CREATE INDEX IF NOT EXISTS idx_salon_category ON "Salon"(category);

-- ============================================================
-- SalonSchedule (opening hours)
-- ============================================================
CREATE TABLE IF NOT EXISTS "SalonSchedule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL, -- 0=Monday ... 6=Sunday
  "openTime" TEXT NOT NULL,
  "closeTime" TEXT NOT NULL,
  "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salonschedule_salon ON "SalonSchedule"("salonId");

-- ============================================================
-- SalonPhoto
-- ============================================================
CREATE TABLE IF NOT EXISTS "SalonPhoto" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salonphoto_salon ON "SalonPhoto"("salonId");

-- ============================================================
-- ServiceCategory
-- ============================================================
CREATE TABLE IF NOT EXISTS "ServiceCategory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  "salonId" UUID REFERENCES "Salon"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Service
-- ============================================================
CREATE TABLE IF NOT EXISTS "Service" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  "categoryId" TEXT REFERENCES "ServiceCategory"(id) ON DELETE SET NULL,
  "isOnlineBookable" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "bufferTime" INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_salon ON "Service"("salonId");
CREATE INDEX IF NOT EXISTS idx_service_category ON "Service"("categoryId");

-- ============================================================
-- StaffMember
-- ============================================================
CREATE TABLE IF NOT EXISTS "StaffMember" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  "displayName" TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  avatar TEXT,
  "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffmember_salon ON "StaffMember"("salonId");

-- ============================================================
-- StaffService (many-to-many: staff <-> service)
-- ============================================================
CREATE TABLE IF NOT EXISTS "StaffService" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "staffId" TEXT NOT NULL REFERENCES "StaffMember"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("staffId", "serviceId")
);

CREATE INDEX IF NOT EXISTS idx_staffservice_staff ON "StaffService"("staffId");
CREATE INDEX IF NOT EXISTS idx_staffservice_service ON "StaffService"("serviceId");

-- ============================================================
-- StaffSchedule (per-staff weekly schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS "StaffSchedule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "staffId" TEXT NOT NULL REFERENCES "StaffMember"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL, -- 0=Monday ... 6=Sunday
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isWorking" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffschedule_staff ON "StaffSchedule"("staffId");

-- ============================================================
-- Booking
-- ============================================================
CREATE TABLE IF NOT EXISTS "Booking" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ NOT NULL,
  "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'ONLINE',
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
  notes TEXT,
  "cancellationReason" TEXT,
  "cancelledAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS idx_booking_salon ON "Booking"("salonId");
CREATE INDEX IF NOT EXISTS idx_booking_starttime ON "Booking"("startTime");
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"(status);

-- ============================================================
-- BookingItem
-- ============================================================
CREATE TABLE IF NOT EXISTS "BookingItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "staffId" TEXT NOT NULL REFERENCES "StaffMember"(id) ON DELETE CASCADE,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ NOT NULL,
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookingitem_booking ON "BookingItem"("bookingId");
CREATE INDEX IF NOT EXISTS idx_bookingitem_staff ON "BookingItem"("staffId");
CREATE INDEX IF NOT EXISTS idx_bookingitem_starttime ON "BookingItem"("startTime");

-- ============================================================
-- Review
-- ============================================================
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT REFERENCES "Booking"(id) ON DELETE SET NULL,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "salonId" UUID NOT NULL REFERENCES "Salon"(id) ON DELETE CASCADE,
  "overallRating" INTEGER NOT NULL,
  "qualityRating" INTEGER,
  "timingRating" INTEGER,
  "receptionRating" INTEGER,
  "hygieneRating" INTEGER,
  comment TEXT,
  author TEXT,
  date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_salon ON "Review"("salonId");
CREATE INDEX IF NOT EXISTS idx_review_user ON "Review"("userId");
CREATE INDEX IF NOT EXISTS idx_review_booking ON "Review"("bookingId");
CREATE INDEX IF NOT EXISTS idx_review_status ON "Review"(status);

-- ============================================================
-- Payment
-- ============================================================
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
  method TEXT,
  amount DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_booking ON "Payment"("bookingId");

-- ============================================================
-- Ensure RLS is disabled for service_role access (Supabase Admin)
-- By default Supabase enables RLS. Since the app uses service_role
-- key for all server queries, we need to allow access.
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Salon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalonSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalonPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for service_role (admin) access
-- The app uses supabaseAdmin (service_role key) for all server-side queries.
-- Service role bypasses RLS by default, but explicit policies ensure anon access works too.

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'User','Salon','SalonSchedule','SalonPhoto','ServiceCategory',
    'Service','StaffMember','StaffService','StaffSchedule',
    'Booking','BookingItem','Review','Payment'
  ]) LOOP
    -- Drop existing policies if any
    EXECUTE format('DROP POLICY IF EXISTS admin_all ON %I', t);
    -- Create policy allowing service_role full access
    EXECUTE format(
      'CREATE POLICY admin_all ON %I FOR ALL USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;
