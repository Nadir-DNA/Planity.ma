/**
 * Booking Repository Implementation
 * Uses Supabase Admin REST API instead of Prisma
 */

import { supabaseAdmin, findById, findByUnique, findMany, findFirst, insertRow, updateRow, countRows } from "@/lib/supabase-helpers";

export class BookingRepository {
  async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("Booking")
      .select("*, items:BookingItem(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Booking.findById: ${error.message}`);
    }
    return data;
  }

  async findByReference(reference: string) {
    return findByUnique("Booking", "reference", reference);
  }

  async findByUserId(userId: string, status?: string) {
    const filters: Record<string, unknown> = { userId };
    if (status) filters.status = status;

    return findMany("Booking", {
      filters,
      order: { column: "startTime", ascending: false },
    });
  }

  async findBySalon(salonId: string, date?: string, staffId?: string) {
    const filters: Record<string, unknown> = { salonId };
    if (date) {
      const start = new Date(date);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      filters.startTime = { gte: start.toISOString() };
      // endTime filter not easily composable, handled in separate calls or PostgREST
    }

    return findMany("Booking", {
      filters,
      order: { column: "startTime", ascending: true },
    });
  }

  async findCancellable(bookingId: string, userId: string) {
    // Prisma:findFirst with OR + status in — in Supabase we use .or()
    const { data, error } = await supabaseAdmin
      .from("Booking")
      .select("*")
      .eq("id", bookingId)
      .or(`userId.eq.${userId},salon.ownerId.eq.${userId}`)
      .in("status", ["PENDING", "CONFIRMED"])
      .limit(1);

    if (error) throw new Error(`findCancellable: ${error.message}`);
    return (data && data.length > 0) ? data[0] : null;
  }

  async createBookingWithItems(params: {
    reference: string;
    userId: string;
    salonId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    source: string;
    status: string;
    notes?: string;
    items: Array<{
      serviceId: string;
      staffId: string;
      startTime: Date;
      endTime: Date;
      price: number;
    }>;
    services: Array<{ serviceId: string; staffId?: string }>;
    endTimeCheck: Date;
  }): Promise<unknown> {
    // Create booking first
    const booking = await insertRow("Booking", {
      reference: params.reference,
      userId: params.userId,
      salonId: params.salonId,
      startTime: params.startTime.toISOString(),
      endTime: params.endTime.toISOString(),
      totalPrice: params.totalPrice,
      source: params.source,
      status: params.status,
      notes: params.notes || null,
    });

    // Then create booking items
    const bookingId = (booking as Record<string, unknown>).id as string;
    const items = params.items.map((item) => ({
      bookingId,
      serviceId: item.serviceId,
      staffId: item.staffId,
      startTime: item.startTime.toISOString(),
      endTime: item.endTime.toISOString(),
      price: item.price,
    }));

    await supabaseAdmin.from("BookingItem").insert(items).select("*");

    // Fetch booking with items
    return this.findById(bookingId);
  }

  async updateStatus(bookingId: string, data: {
    status: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
  }) {
    const updateData: Record<string, unknown> = {
      status: data.status,
    };
    if (data.cancellationReason) updateData.cancellationReason = data.cancellationReason;
    if (data.cancelledAt) updateData.cancelledAt = data.cancelledAt.toISOString();
    if (data.cancelledBy) updateData.cancelledBy = data.cancelledBy;

    return updateRow("Booking", bookingId, updateData);
  }

  async checkConflict(staffId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const { count, error } = await supabaseAdmin
      .from("BookingItem")
      .select("*", { count: "exact", head: true })
      .eq("staffId", staffId)
      .lt("startTime", endTime.toISOString())
      .gt("endTime", startTime.toISOString());

    if (error) throw new Error(`checkConflict: ${error.message}`);
    return (count ?? 0) > 0;
  }
}

export function createBookingRepository() {
  return new BookingRepository();
}