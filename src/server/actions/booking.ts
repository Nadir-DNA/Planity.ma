"use server";

import { supabaseAdmin, findByUnique, findFirst } from "@/lib/supabase-helpers";
import { getUser } from "@/lib/auth";
import { generateBookingReference } from "@/lib/utils";
import { createBookingSchema, type CreateBookingInput } from "@/server/validators/booking.schema";

export async function createBooking(input: CreateBookingInput) {
  // Verify authentication
  const user = await getUser();
  if (!user?.id) {
    return { error: "Authentification requise" };
  }

  const data = createBookingSchema.parse(input);

  // Fetch services to calculate total price and duration
  const serviceIds = data.services.map((s) => s.serviceId);
  const { data: services, error: svcError } = await supabaseAdmin
    .from("Service")
    .select("*")
    .in("id", serviceIds)
    .eq("salonId", data.salonId);

  if (svcError) throw new Error(`createBooking fetchServices: ${svcError.message}`);

  if (!services || services.length !== serviceIds.length) {
    return { error: "Un ou plusieurs services sont invalides" };
  }

  const totalPrice = services.reduce((sum: number, s: { price: number }) => sum + s.price, 0);
  const totalDuration = services.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);

  // Parse start time
  const [year, month, day] = data.date.split("-").map(Number);
  const [hours, minutes] = data.time.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + totalDuration * 60000);

  // Resolve staff IDs: for services without a staffId, find an eligible staff member
  type ResolvedService = { serviceId: string; staffId: string };
  const resolvedServices: ResolvedService[] = await Promise.all(
    data.services.map(async (svc): Promise<ResolvedService> => {
      if (svc.staffId) return { serviceId: svc.serviceId, staffId: svc.staffId };

      // No staff preference — find first active staff member assigned to this service
      const { data: staffServiceRows } = await supabaseAdmin
        .from("StaffService")
        .select("staffId")
        .eq("serviceId", svc.serviceId);

      const staffIds = (staffServiceRows || []).map((ss: { staffId: string }) => ss.staffId);

      if (staffIds.length > 0) {
        const { data: assignedStaff } = await supabaseAdmin
          .from("StaffMember")
          .select("id")
          .eq("isActive", true)
          .in("id", staffIds)
          .limit(1);

        if (assignedStaff && assignedStaff.length > 0) {
          return { serviceId: svc.serviceId, staffId: assignedStaff[0].id };
        }
      }

      // Fallback: any active staff member in the salon
      const { data: salonStaff } = await supabaseAdmin
        .from("StaffMember")
        .select("id")
        .eq("salonId", data.salonId)
        .eq("isActive", true)
        .limit(1);

      if (!salonStaff || salonStaff.length === 0) {
        throw new Error("Aucun professionnel disponible dans ce salon");
      }

      return { serviceId: svc.serviceId, staffId: salonStaff[0].id };
    })
  );

  // Generate unique reference
  let reference: string;
  let attempts = 0;
  do {
    reference = generateBookingReference();
    const existing = await findByUnique("Booking", "reference", reference);
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  // Check for conflicts and create booking
  // Note: Supabase doesn't have Prisma-style $transaction for multi-table atomicity
  // We perform sequential operations with conflict checks

  // Check for conflicts on each booking item
  for (const svc of resolvedServices) {
    const { data: conflicting } = await supabaseAdmin
      .from("BookingItem")
      .select("id, bookingId")
      .eq("staffId", svc.staffId)
      .lt("startTime", endTime.toISOString())
      .gt("endTime", startTime.toISOString());

    if (conflicting && conflicting.length > 0) {
      // Verify the parent bookings are in active status
      const activeBookingIds = conflicting.map((ci: { bookingId: string }) => ci.bookingId);
      if (activeBookingIds.length > 0) {
        const { data: activeBookings } = await supabaseAdmin
          .from("Booking")
          .select("id")
          .in("id", activeBookingIds)
          .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

        if (activeBookings && activeBookings.length > 0) {
          throw new Error("Le creneau n'est plus disponible pour ce professionnel");
        }
      }
    }
  }

  // Create booking
  const { data: newBooking, error: bookingError } = await supabaseAdmin
    .from("Booking")
    .insert({
      reference: reference!,
      userId: user.id,
      salonId: data.salonId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalPrice,
      source: "ONLINE",
      status: "CONFIRMED",
      notes: data.notes || null,
    })
    .select("*")
    .single();

  if (bookingError) throw new Error(`createBooking insert: ${bookingError.message}`);

  const bookingId = newBooking.id;

  // Create booking items
  let itemStartTime = startTime;
  const items = resolvedServices.map((svc) => {
    const service = services.find((s: { id: string }) => s.id === svc.serviceId)!;
    const itemEndTime = new Date(itemStartTime.getTime() + (service as { duration: number }).duration * 60000);
    const item = {
      bookingId,
      serviceId: svc.serviceId,
      staffId: svc.staffId,
      startTime: new Date(itemStartTime).toISOString(),
      endTime: itemEndTime.toISOString(),
      price: (service as { price: number }).price,
    };
    itemStartTime = itemEndTime;
    return item;
  });

  const { error: itemsError } = await supabaseAdmin
    .from("BookingItem")
    .insert(items);

  if (itemsError) throw new Error(`createBooking insertItems: ${itemsError.message}`);

  // Fetch full booking with relations
  const { data: fullBooking, error: fetchError } = await supabaseAdmin
    .from("Booking")
    .select(`
      *,
      items:BookingItem(*, service:Service!serviceId(*), staff:StaffMember!staffId(*))
    `)
    .eq("id", bookingId)
    .single();

  if (fetchError) throw new Error(`createBooking fetchBooking: ${fetchError.message}`);

  return { success: true, booking: fullBooking };
}