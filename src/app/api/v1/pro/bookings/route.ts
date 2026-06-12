import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, getProSalonId } from "@/lib/auth";
import { sendBookingCancellation } from "@/server/services/notification.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const statusSchema = z.enum(BOOKING_STATUSES);

// Transitions autorisées (machine à états)
const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Salon du pro (owner OU membre d'équipe via StaffMember.userId)
    const salonId = await getProSalonId(user);
    if (!salonId) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }
    const salon = { id: salonId };

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    // Build query
    let query = supabaseAdmin
      .from("Booking")
      .select("*, user:User(id, name, email, phone), items:BookingItem(*, service:Service(id, name, price, duration), staff:StaffMember(id, displayName, color))")
      .eq("salonId", salon.id);

    if (status) {
      query = query.eq("status", status);
    } else {
      // Default: show active bookings (not cancelled)
      query = query.in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query = query.gte("startTime", dayStart.toISOString()).lte("startTime", dayEnd.toISOString());
    } else if (startDate && endDate) {
      query = query.gte("startTime", new Date(startDate).toISOString()).lte("startTime", new Date(endDate).toISOString());
    }

    query = query.order("startTime", { ascending: true });

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Pro bookings fetch error:", bookingsError);
      return NextResponse.json(
        { error: "Erreur lors du chargement des réservations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error("Pro bookings fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des réservations" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const salonId = await getProSalonId(user);
    if (!salonId) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { bookingId, status: rawStatus, cancellationReason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requis" }, { status: 400 });
    }

    const parsedStatus = statusSchema.safeParse(rawStatus);
    if (!parsedStatus.success) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const newStatus = parsedStatus.data;

    // Verify booking belongs to this salon
    const { data: booking } = await supabaseAdmin
      .from("Booking")
      .select("id, status")
      .eq("id", bookingId)
      .eq("salonId", salonId)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    // Machine à états : pas de résurrection d'une résa annulée/terminée
    const allowed = ALLOWED_TRANSITIONS[booking.status as string] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Transition impossible : ${booking.status} → ${newStatus}` },
        { status: 409 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    const isCancellation = newStatus === "CANCELLED" || newStatus === "NO_SHOW";
    if (isCancellation) {
      updateData.cancelledAt = new Date().toISOString();
      updateData.cancellationReason = cancellationReason || null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("Booking")
      .update(updateData)
      .eq("id", bookingId)
      .select("*, user:User(id, name, email, phone), items:BookingItem(*, service:Service(id, name, price), staff:StaffMember(id, displayName, color))")
      .single();

    if (updateError) {
      console.error("Booking update error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    if (isCancellation) {
      // Libérer les créneaux + prévenir le client (non bloquant)
      await supabaseAdmin
        .from("BookingItem")
        .update({ isCancelled: true })
        .eq("bookingId", bookingId);

      if (newStatus === "CANCELLED") {
        sendBookingCancellation(bookingId).catch(console.error);
      }
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}