import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { paginationSchema } from "@/lib/validations";
import { generateBookingReference } from "@/lib/utils";

import { sendBookingConfirmation, sendBookingCancellation } from "@/server/services/notification.service";
import { createMoroccoDate } from "@/lib/timezone";
import { isWithinSalonHours, isWithinStaffSchedule, timeToMinutes } from "@/lib/booking-window";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // CRIT-01 FIX: Require authentication — only fetch own bookings
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Parse pagination — defaults to page 1, limit 20
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20;

    // Always filter by authenticated user's ID (ignore client-sent userId)
    let query = supabaseAdmin
      .from("Booking")
      .select(`
        *,
        salon:Salon!salonId(id, name, slug, city, address),
        items:BookingItem(id, startTime, endTime, price, service:Service!serviceId(id, name, price, duration), staff:StaffMember!staffId(id, displayName)),
        payment:Payment(id, status, method)
      `, { count: "exact" })
      .eq("userId", user.id)
      .order("startTime", { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1);

    if (status) query = query.eq("status", status);

    const { data: bookings, count: total, error } = await query;

    if (error) {
      console.error("Bookings fetch Supabase error:", JSON.stringify(error));
      return NextResponse.json({
        bookings: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
    }

    // Strip PII: don't leak user email/phone
    const safeBookings = (bookings || []).map(({ user: _u, ...rest }: Record<string, unknown>) => rest);

    return NextResponse.json({
      bookings: safeBookings,
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit),
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json({
      bookings: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { salonId, services, date, time, notes } = body;

    // Use authenticated user's ID — never trust client-sent userId
    const userId = user.id;

    if (!salonId || !services?.length || !date || !time) {
      return NextResponse.json(
        { error: "Donnees manquantes" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return NextResponse.json({ error: "Date ou heure invalide" }, { status: 400 });
    }

    // L'heure choisie est une heure locale Maroc → conversion explicite en UTC
    const startTime = createMoroccoDate(date, time);

    // Reject past dates
    if (isNaN(startTime.getTime()) || startTime < new Date()) {
      return NextResponse.json(
        { error: "Impossible de réserver dans le passé" },
        { status: 400 }
      );
    }

    // Le salon doit exister et être actif (abonnement payé)
    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id, isActive")
      .eq("id", salonId)
      .maybeSingle();

    if (!salon || !salon.isActive) {
      return NextResponse.json(
        { error: "Ce salon n'accepte pas de réservations en ligne pour le moment" },
        { status: 400 }
      );
    }

    // Fetch services
    const serviceIds = services.map((s: { serviceId: string }) => s.serviceId);

    const { data: dbServices, error: svcError } = await supabaseAdmin
      .from("Service")
      .select("*")
      .in("id", serviceIds)
      .eq("salonId", salonId);

    if (svcError || !dbServices || dbServices.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs services sont invalides" },
        { status: 400 }
      );
    }

    const totalPrice = dbServices.reduce((sum: number, s: { price: number }) => sum + s.price, 0);
    const totalDuration = dbServices.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);

    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    // Créneau dans les horaires d'ouverture du salon (heure locale Maroc)
    const startMin = timeToMinutes(time);
    const salonWindow = { startMin, endMin: startMin + totalDuration };
    const salonHoursCheck = await isWithinSalonHours(salonId, date, salonWindow);
    if (!salonHoursCheck.ok) {
      return NextResponse.json({ error: salonHoursCheck.reason }, { status: 400 });
    }

    // Resolve staff IDs: for services without a staffId, find an eligible staff member
    const resolvedServices = await Promise.all(
      services.map(async (svc: { serviceId: string; staffId?: string }) => {
        if (svc.staffId) return svc;

        // No staff preference — find first active staff member assigned to this service
        const { data: assignedStaff } = await supabaseAdmin
          .from("StaffService")
          .select("staffId, staff:StaffMember(id, isActive)")
          .eq("serviceId", svc.serviceId)
          .limit(10);

        const activeAssigned = assignedStaff?.find((as: Record<string, unknown>) => {
          const staff = as.staff as Record<string, unknown> | Record<string, unknown>[] | undefined;
          const isActive = Array.isArray(staff) ? staff[0]?.isActive : staff?.isActive;
          return isActive === true;
        });

        if (activeAssigned) {
          return { ...svc, staffId: activeAssigned.staffId };
        }

        // Fallback: any active staff member in the salon
        const { data: salonStaff } = await supabaseAdmin
          .from("StaffMember")
          .select("id")
          .eq("salonId", salonId)
          .eq("isActive", true)
          .limit(1)
          .maybeSingle();

        if (!salonStaff) {
          throw new Error("Aucun professionnel disponible dans ce salon");
        }

        return { ...svc, staffId: salonStaff.id };
      })
    );

    // CRIT-03 FIX: Validate all staffId belong to the salon
    for (const svc of resolvedServices) {
      if (svc.staffId) {
        const { data: staffMember } = await supabaseAdmin
          .from("StaffMember")
          .select("id, salonId, isActive")
          .eq("id", svc.staffId)
          .maybeSingle();
        if (!staffMember || staffMember.salonId !== salonId || !staffMember.isActive) {
          return NextResponse.json(
            { error: "Professionnel invalide pour ce salon" },
            { status: 400 }
          );
        }
      }
    }

    // Generate unique reference
    let reference = generateBookingReference();
    let { data: existing } = await supabaseAdmin
      .from("Booking")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();
    let attempts = 0;
    while (existing && attempts < 10) {
      reference = generateBookingReference();
      const { data: check } = await supabaseAdmin
        .from("Booking")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();
      existing = check;
      attempts++;
    }

    // Calcul des items UNE seule fois (durées cumulées) — utilisés pour le
    // pré-check de conflits ET l'insertion (mêmes intervalles, plus de divergence)
    let itemCursor = startTime;
    let itemCursorMin = startMin;
    const items = resolvedServices.map((svc: { serviceId: string; staffId: string }) => {
      const service = dbServices.find((s: { id: string }) => s.id === svc.serviceId)!;
      const itemEnd = new Date(itemCursor.getTime() + service.duration * 60000);
      const item = {
        serviceId: svc.serviceId,
        staffId: svc.staffId,
        startTime: itemCursor.toISOString(),
        endTime: itemEnd.toISOString(),
        price: service.price,
        startMin: itemCursorMin,
        endMin: itemCursorMin + service.duration,
      };
      itemCursor = itemEnd;
      itemCursorMin += service.duration;
      return item;
    });

    // Planning du professionnel + pré-check de conflits (UX : 409 propre avant l'insert)
    for (const item of items) {
      const staffCheck = await isWithinStaffSchedule(item.staffId, date, {
        startMin: item.startMin,
        endMin: item.endMin,
      });
      if (!staffCheck.ok) {
        return NextResponse.json({ error: staffCheck.reason }, { status: 409 });
      }

      const { data: conflicts } = await supabaseAdmin
        .from("BookingItem")
        .select("id")
        .eq("staffId", item.staffId)
        .eq("isCancelled", false)
        .lt("startTime", item.endTime)
        .gt("endTime", item.startTime)
        .limit(1);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: "Créneau non disponible pour ce professionnel" },
          { status: 409 }
        );
      }
    }

    // Création atomique (Booking + items en une transaction).
    // La contrainte d'exclusion bookingitem_no_overlap est la vraie garantie
    // anti double-booking : en cas de course, l'insert échoue (23P01) → 409.
    const { data: bookingId, error: createError } = await supabaseAdmin.rpc(
      "create_booking_atomic",
      {
        p_reference: reference,
        p_user_id: userId,
        p_salon_id: salonId,
        p_start: startTime.toISOString(),
        p_end: endTime.toISOString(),
        p_total_price: totalPrice,
        p_notes: notes || null,
        p_items: items.map(({ startMin: _s, endMin: _e, ...item }) => item),
      }
    );

    if (createError || !bookingId) {
      if (createError?.code === "23P01") {
        return NextResponse.json(
          { error: "Le créneau vient d'être réservé par quelqu'un d'autre" },
          { status: 409 }
        );
      }
      console.error("Booking creation Supabase error:", JSON.stringify(createError));
      return NextResponse.json(
        { error: "Erreur lors de la creation" },
        { status: 500 }
      );
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("Booking")
      .select("*, items:BookingItem(*, service:Service(*), staff:StaffMember(*)), salon:Salon(id, name, slug, city, address)")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("Booking fetch after create error:", JSON.stringify(fetchError));
      return NextResponse.json({ booking: { id: bookingId, reference } }, { status: 201 });
    }

    // Send confirmation email/SMS (non-blocking)
    sendBookingConfirmation(booking.id).catch(console.error);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la creation";
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Non autorise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId requis" },
        { status: 400 }
      );
    }

    // Check ownership: user owns booking OR user owns salon
    // First, find the booking
    const { data: booking } = await supabaseAdmin
      .from("Booking")
      .select("id, userId, salonId, status")
      .eq("id", bookingId)
      .in("status", ["PENDING", "CONFIRMED"])
      .maybeSingle();

    if (!booking) {
      return NextResponse.json(
        { error: "Reservation non trouvee ou non annulable" },
        { status: 404 }
      );
    }

    // Check if user owns the booking or the salon
    if (booking.userId !== user.id) {
      const { data: salon } = await supabaseAdmin
        .from("Salon")
        .select("id")
        .eq("id", booking.salonId)
        .eq("ownerId", user.id)
        .maybeSingle();

      if (!salon) {
        return NextResponse.json(
          { error: "Reservation non trouvee ou non annulable" },
          { status: 404 }
        );
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("Booking")
      .update({
        status: "CANCELLED",
        cancellationReason: reason || null,
        cancelledAt: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Booking cancellation Supabase error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de l'annulation" },
        { status: 500 }
      );
    }

    // Libérer les créneaux (contrainte d'exclusion ignorera ces items)
    await supabaseAdmin
      .from("BookingItem")
      .update({ isCancelled: true })
      .eq("bookingId", bookingId);

    // Send cancellation email (non-blocking)
    sendBookingCancellation(bookingId).catch(console.error);

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}