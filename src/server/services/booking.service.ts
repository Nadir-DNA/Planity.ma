import { supabaseAdmin, findByUnique, findMany, findFirst, insertRow, updateRow } from "@/lib/supabase-helpers";
import { generateBookingReference } from "@/lib/utils";

interface CreateBookingParams {
  userId: string;
  salonId: string;
  services: { serviceId: string; staffId?: string }[];
  date: string;
  time: string;
  notes?: string;
}

export async function createBooking(params: CreateBookingParams) {
  const { userId, salonId, services, date, time, notes } = params;

  // Fetch service details
  const serviceIds = services.map((s) => s.serviceId);
  const { data: dbServices, error: svcError } = await supabaseAdmin
    .from("Service")
    .select("*")
    .in("id", serviceIds)
    .eq("salonId", salonId);

  if (svcError) throw new Error(`createBooking fetchServices: ${svcError.message}`);

  if (!dbServices || dbServices.length !== serviceIds.length) {
    throw new Error("Un ou plusieurs services sont invalides");
  }

  const totalPrice = dbServices.reduce((sum: number, s: { price: number }) => sum + s.price, 0);
  const totalDuration = dbServices.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + totalDuration * 60000);

  // Resolve staff IDs: for services without a staffId, find an eligible staff member
  const resolvedServices = await Promise.all(
    services.map(async (svc) => {
      if (svc.staffId) return { ...svc, staffId: svc.staffId };

      // No staff preference — find first active staff member assigned to this service
      const { data: assignedStaff } = await supabaseAdmin
        .from("StaffMember")
        .select("id")
        .eq("salonId", salonId)
        .eq("isActive", true)
        .in(
          "id",
          // Get staff IDs through StaffService join
          (await supabaseAdmin
            .from("StaffService")
            .select("staffId")
            .eq("serviceId", svc.serviceId)
          ).data?.map((ss: { staffId: string }) => ss.staffId) ?? []
        )
        .limit(1);

      if (assignedStaff && assignedStaff.length > 0) {
        return { ...svc, staffId: assignedStaff[0].id };
      }

      // Fallback: any active staff member in the salon
      const { data: salonStaff } = await supabaseAdmin
        .from("StaffMember")
        .select("id")
        .eq("salonId", salonId)
        .eq("isActive", true)
        .limit(1);

      if (!salonStaff || salonStaff.length === 0) {
        throw new Error("Aucun professionnel disponible dans ce salon");
      }

      return { ...svc, staffId: salonStaff[0].id };
    })
  );

  // Generate unique reference
  let reference = generateBookingReference();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await findByUnique("Booking", "reference", reference);
    if (!existing) break;
    reference = generateBookingReference();
    attempts++;
  }

  // Check for conflicts and create booking + items
  // Note: Supabase doesn't have transactions like Prisma's $transaction.
  // We do sequential operations. For production, consider using an RPC or database function.

  // Check for conflicts
  for (const svc of resolvedServices) {
    const conflicting = await supabaseAdmin
      .from("BookingItem")
      .select("id")
      .eq("staffId", svc.staffId)
      .lt("startTime", endTime.toISOString())
      .gt("endTime", startTime.toISOString())
      .limit(1);

    // Also verify via Booking status
    if (conflicting.data && conflicting.data.length > 0) {
      // Verify the booking is in an active status
      const bookingIds = conflicting.data.map((ci: { id: string }) => ci.id);
      // We need to check if the parent booking is active
      // For simplicity we treat any overlap as a conflict (same as original)
      // A more precise check would filter by booking status
      throw new Error("Creneau non disponible");
    }
  }

  // Create booking
  const booking = await insertRow("Booking", {
    reference,
    userId,
    salonId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalPrice,
    source: "ONLINE",
    status: "CONFIRMED",
    notes: notes || null,
  });

  const bookingId = (booking as Record<string, unknown>).id as string;

  // Create booking items
  let currentStart = startTime;
  const items = resolvedServices.map((svc) => {
    const service = dbServices.find((s: { id: string }) => s.id === svc.serviceId)!;
    const itemEnd = new Date(currentStart.getTime() + (service as { duration: number }).duration * 60000);
    const item = {
      bookingId,
      serviceId: svc.serviceId,
      staffId: svc.staffId,
      startTime: new Date(currentStart).toISOString(),
      endTime: itemEnd.toISOString(),
      price: (service as { price: number }).price,
    };
    currentStart = itemEnd;
    return item;
  });

  await supabaseAdmin.from("BookingItem").insert(items);

  // Fetch full booking with relations
  const { data: fullBooking, error: fetchError } = await supabaseAdmin
    .from("Booking")
    .select(`
      *,
      items:BookingItem(*, service:Service!serviceId(*), staff:StaffMember!staffId(*)),
      salon:Salon!salonId(name, slug, phone, email),
      user:User!userId(name, email, phone)
    `)
    .eq("id", bookingId)
    .single();

  if (fetchError) throw new Error(`createBooking fetchBooking: ${fetchError.message}`);

  return fullBooking;
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
) {
  // Find cancellable booking
  const { data: booking, error } = await supabaseAdmin
    .from("Booking")
    .select("id, userId, salonId")
    .eq("id", bookingId)
    .or(`userId.eq.${userId}`)
    .in("status", ["PENDING", "CONFIRMED"])
    .limit(1);

  // Also check via salon ownership
  let cancellable = booking && booking.length > 0 ? booking[0] : null;

  if (!cancellable) {
    // Check if user owns the salon
    const { data: salonBooking } = await supabaseAdmin
      .from("Booking")
      .select("id, salon:Salon!salonId(ownerId)")
      .eq("id", bookingId)
      .in("status", ["PENDING", "CONFIRMED"])
      .limit(1)
      .single();

    if (!salonBooking || ((salonBooking as Record<string, unknown>).salon as Record<string, unknown>)?.ownerId !== userId) {
      throw new Error("Reservation non trouvee ou non annulable");
    }
    cancellable = salonBooking as unknown as typeof cancellable;
  }

  return updateRow("Booking", bookingId, {
    status: "CANCELLED",
    cancellationReason: reason || null,
    cancelledAt: new Date().toISOString(),
    cancelledBy: userId,
  });
}

export async function getUserBookings(userId: string, status?: string) {
  let query = supabaseAdmin
    .from("Booking")
    .select(`
      *,
      items:BookingItem(*, service:Service!serviceId(*), staff:StaffMember!staffId(*)),
      salon:Salon!salonId(name, slug, city, address),
      payment:Payment!bookingId(*)
    `)
    .eq("userId", userId)
    .order("startTime", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`getUserBookings: ${error.message}`);
  return data || [];
}

export async function getSalonBookings(
  salonId: string,
  date?: string,
  staffId?: string
) {
  let query = supabaseAdmin
    .from("Booking")
    .select(`
      *,
      items:BookingItem(*, service:Service!serviceId(*), staff:StaffMember!staffId(*)),
      user:User!userId(name, phone, email)
    `)
    .eq("salonId", salonId)
    .order("startTime", { ascending: true });

  if (date) {
    const dayStart = new Date(date + "T00:00:00").toISOString();
    const dayEnd = new Date(date + "T23:59:59").toISOString();
    query = query.gte("startTime", dayStart).lte("endTime", dayEnd);
  }

  // If staffId, we need to filter by items.staffId — this needs a sub-query
  // For simplicity we filter after fetch if staffId is specified
  const { data, error } = await query;
  if (error) throw new Error(`getSalonBookings: ${error.message}`);

  let bookings = data || [];

  if (staffId && bookings) {
    bookings = bookings.filter((b: Record<string, unknown>) => {
      const items = b.items as Record<string, unknown>[];
      return items?.some((item) => item.staffId === staffId);
    });
  }

  return bookings;
}