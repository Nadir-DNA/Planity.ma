
/**
 * Booking Repository Implementation
 */

import { db } from "@/lib/db";
import type { Booking, BookingItem } from "@prisma/client";

export class BookingRepository {
  async findById(id: string): Promise<Booking | null> {
    return db.booking.findUnique({ where: { id } });
  }

  async findByReference(reference: string): Promise<Booking | null> {
    return db.booking.findUnique({ where: { reference } });
  }

  async findByUserId(userId: string, status?: string): Promise<Booking[]> {
    return db.booking.findMany({
      where: { userId, status: status as any },
      orderBy: { startTime: "desc" },
    });
  }

  async findBySalon(salonId: string, date?: string, staffId?: string): Promise<Booking[]> {
    const where: any = { salonId };
    if (date) {
      const start = new Date(date);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.startTime = { gte: start, lt: end };
    }
    return db.booking.findMany({ where, orderBy: { startTime: "asc" } });
  }

  async findCancellable(bookingId: string, userId: string): Promise<Booking | null> {
    return db.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
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
  }): Promise<Booking & { items: BookingItem[] }> {
    const booking = await db.booking.create({
      data: {
        reference: params.reference,
        userId: params.userId,
        salonId: params.salonId,
        startTime: params.startTime,
        endTime: params.endTime,
        totalPrice: params.totalPrice,
        source: params.source as any,
        status: params.status as any,
        notes: params.notes,
        items: {
          create: params.items,
        },
      },
      include: { items: true },
    });

    return booking as Booking & { items: BookingItem[] };
  }

  async updateStatus(bookingId: string, data: {
    status: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
  }): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status as any,
        cancellationReason: data.cancellationReason,
        cancelledAt: data.cancelledAt,
        cancelledBy: data.cancelledBy,
      },
    });
  }

  async checkConflict(staffId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const count = await db.bookingItem.count({
      where: {
        staffId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    return count > 0;
  }
}

export function createBookingRepository() {
  return new BookingRepository();
}
