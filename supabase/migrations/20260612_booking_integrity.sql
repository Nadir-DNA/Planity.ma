-- Intégrité des réservations : anti double-booking + création atomique

-- 1) Marquage des items annulés (les réservations CANCELLED ne doivent plus bloquer de créneaux)
ALTER TABLE "BookingItem" ADD COLUMN IF NOT EXISTS "isCancelled" BOOLEAN NOT NULL DEFAULT false;

UPDATE "BookingItem" bi
SET "isCancelled" = true
FROM "Booking" b
WHERE b.id = bi."bookingId"
  AND b.status IN ('CANCELLED', 'NO_SHOW')
  AND bi."isCancelled" = false;

-- 2) Contrainte d'exclusion : un même staff ne peut pas avoir deux items actifs qui se chevauchent.
--    C'est LA garantie anti race-condition (le check applicatif n'est qu'un pré-filtre UX).
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "BookingItem" DROP CONSTRAINT IF EXISTS bookingitem_no_overlap;
ALTER TABLE "BookingItem" ADD CONSTRAINT bookingitem_no_overlap
  EXCLUDE USING gist (
    "staffId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE ("isCancelled" = false);

CREATE INDEX IF NOT EXISTS "BookingItem_staffId_startTime_idx"
  ON "BookingItem"("staffId", "startTime");

-- 3) Création atomique Booking + BookingItems (une transaction, la contrainte protège du TOCTOU)
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_reference TEXT,
  p_user_id UUID,
  p_salon_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_total_price DOUBLE PRECISION,
  p_notes TEXT,
  p_items JSONB
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id TEXT;
  v_item JSONB;
BEGIN
  INSERT INTO "Booking"
    (reference, "userId", "salonId", "startTime", "endTime", "totalPrice", source, status, notes, "updatedAt")
  VALUES
    (p_reference, p_user_id, p_salon_id, p_start, p_end, p_total_price, 'ONLINE', 'CONFIRMED', p_notes, now())
  RETURNING id INTO v_booking_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO "BookingItem"
      ("bookingId", "serviceId", "staffId", "startTime", "endTime", price)
    VALUES (
      v_booking_id,
      v_item->>'serviceId',
      v_item->>'staffId',
      (v_item->>'startTime')::timestamptz,
      (v_item->>'endTime')::timestamptz,
      (v_item->>'price')::double precision
    );
  END LOOP;

  RETURN v_booking_id;
END;
$$;

-- Fonction réservée au backend (service role) — jamais exposée aux clients
REVOKE ALL ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) TO service_role;
