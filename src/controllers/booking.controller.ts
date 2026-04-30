
/**
 * Booking Controller - Logic extracted from API route
 * Testable independently of Next.js
 */

import type { IBookingRepository, ISalonRepository, IServiceRepository } from "@/repositories/interfaces";
import { generateBookingReference } from "@/lib/utils";

export interface BookingControllerDeps {
  bookingRepo: IBookingRepository;
  salonRepo: ISalonRepository;
  serviceRepo: IServiceRepository;
}

export interface CreateBookingRequest {
  userId: string;
  salonId: string;
  services: { serviceId: string; staffId?: string }[];
  date: string;
  time: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: {
    id: string;
    reference: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    status: string;
  };
  error?: string;
}

export class BookingController {
  constructor(private deps: BookingControllerDeps) {}

  async createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    const { userId, salonId, services, date, time, notes } = request;

    // Validate salon exists
    const salon = await this.deps.salonRepo.findById(salonId);
    if (!salon) {
      return { success: false, error: "Salon introuvable" };
    }

    // Validate services exist
    const serviceIds = services.map(s => s.serviceId);
    const dbServices = await this.deps.serviceRepo.findManyByIds(serviceIds, salonId);

    if (dbServices.length !== serviceIds.length) {
      return { success: false, error: "Un ou plusieurs services sont invalides" };
    }

    // Calculate totals
    const totalPrice = dbServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = dbServices.reduce((sum, s) => sum + s.duration, 0);

    // Parse date/time
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);

    // Generate unique reference
    const reference = await this.generateUniqueReference();

    // Default staff (first available or "any")
    const defaultStaffId = services[0]?.staffId || "any";

    // Create booking
    try {
      const booking = await this.deps.bookingRepo.createBookingWithItems({
        reference,
        userId,
        salonId,
        startTime,
        endTime,
        totalPrice,
        source: "ONLINE",
        status: "PENDING",
        notes,
        items: services.map((s, i) => {
          const service = dbServices.find(ds => ds.id === s.serviceId)!;
          const itemStartTime = new Date(startTime.getTime() + i * service.duration * 60 * 1000);
          return {
            serviceId: s.serviceId,
            staffId: s.staffId || defaultStaffId,
            startTime: itemStartTime,
            endTime: new Date(itemStartTime.getTime() + service.duration * 60 * 1000),
            price: service.price,
          };
        }),
        services,
        endTimeCheck: endTime,
      });

      return {
        success: true,
        booking: {
          id: booking.id,
          reference: booking.reference,
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
      };
    } catch (error) {
      return { success: false, error: "Erreur lors de la création" };
    }
  }

  private async generateUniqueReference(): Promise<string> {
    let reference = generateBookingReference();
    let attempts = 0;
    
    while (attempts < 10) {
      const existing = await this.deps.bookingRepo.findByReference(reference);
      if (!existing) break;
      reference = generateBookingReference();
      attempts++;
    }
    
    return reference;
  }

  async getBookings(filters: {
    userId?: string;
    salonId?: string;
    status?: string;
  }) {
    const { userId, salonId, status } = filters;

    if (userId) {
      return this.deps.bookingRepo.findByUserId(userId, status);
    }
    
    if (salonId) {
      return this.deps.bookingRepo.findBySalon(salonId);
    }

    return [];
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<BookingResponse> {
    const booking = await this.deps.bookingRepo.findCancellable(bookingId, userId);
    
    if (!booking) {
      return { success: false, error: "Réservation introuvable ou non annulable" };
    }

    const updated = await this.deps.bookingRepo.updateStatus(bookingId, {
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: userId,
    });
    
    return {
      success: true,
      booking: {
        id: updated.id,
        reference: updated.reference,
        startTime: updated.startTime,
        endTime: updated.endTime,
        totalPrice: updated.totalPrice,
        status: updated.status,
      },
    };
  }
}
