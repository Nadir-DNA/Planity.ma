-- Fix: Add default UUID generation for tables with NOT NULL id but no default
-- This allows INSERT without specifying id (auto-generated)

ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "BookingItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Verify
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name IN ('Booking', 'BookingItem') 
AND column_name = 'id';