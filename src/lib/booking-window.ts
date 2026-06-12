/**
 * Validation des fenêtres de réservation.
 *
 * Toutes les heures sont interprétées dans le fuseau du Maroc (Africa/Casablanca)
 * puis stockées en UTC. Utilisé par POST /api/v1/bookings ; la disponibilité
 * (GET /api/v1/availability) applique les mêmes règles de génération de créneaux.
 */

import { supabaseAdmin } from "@/lib/supabase";

/** dayOfWeek du schéma : 0 = Lundi … 6 = Dimanche (depuis "YYYY-MM-DD"). */
export function schemaDayOfWeek(dateStr: string): number {
  const jsDay = new Date(dateStr + "T00:00:00").getDay();
  return (jsDay + 6) % 7;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export interface BookingWindow {
  /** minutes depuis minuit, heure locale Maroc */
  startMin: number;
  endMin: number;
}

/**
 * Le créneau demandé est-il dans les horaires d'ouverture du salon ?
 * Sans SalonSchedule en base, on refuse (un salon actif doit avoir ses horaires).
 */
export async function isWithinSalonHours(
  salonId: string,
  dateStr: string,
  window: BookingWindow,
): Promise<{ ok: boolean; reason?: string }> {
  const dayOfWeek = schemaDayOfWeek(dateStr);

  const { data: hours, error } = await supabaseAdmin
    .from("SalonSchedule")
    .select("openTime, closeTime, isClosed")
    .eq("salonId", salonId)
    .eq("dayOfWeek", dayOfWeek)
    .maybeSingle();

  if (error) {
    throw new Error(`isWithinSalonHours: ${error.message}`);
  }

  if (!hours || hours.isClosed) {
    return { ok: false, reason: "Le salon est fermé ce jour-là" };
  }

  const openMin = timeToMinutes(hours.openTime);
  const closeMin = timeToMinutes(hours.closeTime);

  if (window.startMin < openMin || window.endMin > closeMin) {
    return { ok: false, reason: "Le créneau est en dehors des horaires d'ouverture du salon" };
  }

  return { ok: true };
}

/**
 * Le créneau est-il dans le planning du professionnel ?
 * Si le staff n'a aucune ligne StaffSchedule, on retombe sur les horaires salon
 * (staff créés hors onboarding, planning non configuré).
 */
export async function isWithinStaffSchedule(
  staffId: string,
  dateStr: string,
  window: BookingWindow,
): Promise<{ ok: boolean; reason?: string }> {
  const dayOfWeek = schemaDayOfWeek(dateStr);

  const { data: allSchedules, error } = await supabaseAdmin
    .from("StaffSchedule")
    .select("dayOfWeek, startTime, endTime, isWorking")
    .eq("staffId", staffId);

  if (error) {
    throw new Error(`isWithinStaffSchedule: ${error.message}`);
  }

  // Aucun planning défini → pas de contrainte staff (horaires salon font foi)
  if (!allSchedules || allSchedules.length === 0) {
    return { ok: true };
  }

  const daySchedule = allSchedules.find((s) => s.dayOfWeek === dayOfWeek);
  if (!daySchedule || !daySchedule.isWorking) {
    return { ok: false, reason: "Ce professionnel ne travaille pas ce jour-là" };
  }

  const startMin = timeToMinutes(daySchedule.startTime);
  const endMin = timeToMinutes(daySchedule.endTime);

  if (window.startMin < startMin || window.endMin > endMin) {
    return { ok: false, reason: "Le créneau est en dehors du planning de ce professionnel" };
  }

  return { ok: true };
}
