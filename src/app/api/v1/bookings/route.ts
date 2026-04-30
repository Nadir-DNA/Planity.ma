import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { paginationSchema } from "@/lib/validations";
import { generateBookingReference } from "@/lib/utils";
import { createId as createCuid } from "@paralleldrive/cuid2";
import { sendBookingConfirmation, sendBookingCancellation } from "@/server/services/notification.service";

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
    
    // Validate pagination with Zod
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    // Always filter by authenticated user's ID (ignore client-sent userId)
    let query = supabaseAdmin
      .from("Booking")
      .select("*", { count: "exact" })
      .eq("userId", user.id)
      .order("startTime", { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1);

    if (status) query = query.eq("status", status);

    const { data: bookings, count: total, error } = await query;

    console.log("[DEBUG] GET bookings:", { userId: user.id, count: total, error: error?.message, dataLen: bookings?.length });

    if (error) {
      console.error("Bookings fetch Supabase error:", JSON.stringify(error));
      return NextResponse.json({
        bookings: [],
        total: 0,
        page: 1,
        totalPages: 0,
        _debug: error.message,
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
      _debug: error instanceof Error ? error.message : String(error),
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

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

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

    // Check availability for each service/staff combo
    for (const svc of resolvedServices) {
      const { data: conflicting } = await supabaseAdmin
        .from("BookingItem")
        .select("id")
        .eq("staffId", svc.staffId)
        .lt("startTime", endTime.toISOString())
        .gt("endTime", startTime.toISOString())
        .in("booking.status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

      // Since Supabase doesn't easily join-filter on Booking status for BookingItem,
      // we need to fetch items then filter manually
      const { data: potentialConflicts } = await supabaseAdmin
        .from("BookingItem")
        .select("id, booking:Booking(status)")
        .eq("staffId", svc.staffId)
        .lt("startTime", endTime.toISOString())
        .gt("endTime", startTime.toISOString());

      const hasConflict = potentialConflicts?.some(
        (item: Record<string, unknown>) => {
          const booking = item.booking as Record<string, unknown> | Record<string, unknown>[] | undefined;
          const status = Array.isArray(booking) ? booking[0]?.status : booking?.status;
          return ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(status as string);
        }
      );

      if (hasConflict) {
        return NextResponse.json(
          { error: "Créneau non disponible pour ce professionnel" },
          { status: 409 }
        );
      }
    }

    // Create booking
    let itemStartTime = startTime;
    const items = resolvedServices.map((svc: { serviceId: string; staffId: string }) => {
      const service = dbServices.find((s: { id: string }) => s.id === svc.serviceId)!;
      const itemEndTime = new Date(itemStartTime.getTime() + service.duration * 60000);
      const item = {
        serviceId: svc.serviceId,
        staffId: svc.staffId,
        startTime: new Date(itemStartTime).toISOString(),
        endTime: itemEndTime.toISOString(),
        price: service.price,
      };
      itemStartTime = itemEndTime;
      return item;
    });

    const { data: booking, error: createError } = await supabaseAdmin
      .from("Booking")
      .insert({
        id: createCuid(),
        reference,
        userId,
        salonId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice,
        source: "ONLINE",
        status: "CONFIRMED",
        notes: notes || null,
        updatedAt: new Date().toISOString(),
      })
      .select("*, items:BookingItem(*, service:Service(*), staff:StaffMember(*)), salon:Salon(id, name, slug, city, address)")
      .single();

    if (createError || !booking) {
      console.error("Booking creation Supabase error:", JSON.stringify(createError));
      return NextResponse.json(
        { error: "Erreur lors de la creation", details: createError?.message },
        { status: 500 }
      );
    }

    // Create booking items
    const bookingItems = items.map((item) => ({
      id: createCuid(),
      ...item,
      bookingId: booking.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("BookingItem")
      .insert(bookingItems);

    if (itemsError) {
      console.error("Booking items creation error:", itemsError);
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