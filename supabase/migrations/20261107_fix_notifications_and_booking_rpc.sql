-- Préférences de notification lues/écrites par /api/v1/user/profile et /notifications,
-- jamais créées par une migration : le profil client plantait (42703)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyBookingConfirmed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyBookingReminder" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyMarketing" BOOLEAN NOT NULL DEFAULT false;

-- En prod, Booking.id et BookingItem.bookingId/serviceId/staffId sont des UUID :
-- la version du 12/06 insérait du TEXT (42804), aucune réservation ne pouvait être créée.
-- Signature et type de retour inchangés (le code appelle toujours la même RPC).
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
  v_booking_id UUID;
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
      (v_item->>'serviceId')::uuid,
      (v_item->>'staffId')::uuid,
      (v_item->>'startTime')::timestamptz,
      (v_item->>'endTime')::timestamptz,
      (v_item->>'price')::double precision
    );
  END LOOP;

  RETURN v_booking_id::text;
END;
$$;

REVOKE ALL ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic(TEXT, UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, DOUBLE PRECISION, TEXT, JSONB) TO service_role;

-- Recharger le cache de schéma de PostgREST pour que les colonnes soient visibles tout de suite
NOTIFY pgrst, 'reload schema';
