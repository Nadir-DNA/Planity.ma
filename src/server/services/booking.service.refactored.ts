/**
 * Booking Service - Refactored with DI
 */

import type { Booking, BookingItem, Service as ServiceEntity } from "@prisma/client";
import { generateBookingReference } from "@/lib/utils";
import type { IBookingRepository, IServiceRepository } from "@/repositories/interfaces";

// ============================================
// Types
// ============================================

interface CreateBookingParams {
  userId: string;
  salonId: string;
  services: { serviceId: string; staffId?: string }[];
  date: string;
  time: string;
  notes?: string;
}

interface BookingServiceDeps {
  bookingRepo: IBookingRepository;
  serviceRepo: IServiceRepository;
  generateRef?: () => string;
}

// ============================================
// Factory Function (DI Pattern)
// ============================================

export function createBookingService(deps: BookingServiceDeps) {
  const { bookingRepo, serviceRepo, generateRef = generateBookingReference } = deps;

  return {
    async createBooking(params: CreateBookingParams) {
      const { userId, salonId, services, date, time, notes } = params;

      // Fetch service details via repository
      const serviceIds = services.map((s) => s.serviceId);
      const dbServices = await serviceRepo.findManyByIds(serviceIds, salonId);

      if (dbServices.length !== serviceIds.length) {
        throw new Error("Un ou plusieurs services sont invalides");
      }

      const totalPrice = dbServices.reduce((sum, s) => sum + s.price, 0);
      const totalDuration = dbServices.reduce((sum, s) => sum + s.duration, 0);

      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(year, month - 1, day, hours, minutes);
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);

      // Generate unique reference
      let reference = generateRef();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await bookingRepo.findByReference(reference);
        if (!existing) break;
        reference = generateRef();
        attempts++;
      }

      // Build booking items
      let currentStart = startTime;
      const items = services.map((svc) => {
        const service = dbServices.find((s) => s.id === svc.serviceId)!;
        const itemEnd = new Date(currentStart.getTime() + service.duration * 60000);
        const item = {
          serviceId: svc.serviceId,
          staffId: svc.staffId!,
          startTime: new Date(currentStart),
          endTime: itemEnd,
          price: service.price,
        };
        currentStart = itemEnd;
        return item;
      });

      // Create booking via repository (handles transaction internally)
      return bookingRepo.createBookingWithItems({
        reference,
        userId,
        salonId,
        startTime,
        endTime,
        totalPrice,
        source: "ONLINE",
        status: "CONFIRMED",
        notes,
        items,
        services,
        endTimeCheck: endTime,
      });
    },

    async cancelBooking(bookingId: string, userId: string, reason?: string) {
      const booking = await bookingRepo.findCancellable(bookingId, userId);

      if (!booking) {
        throw new Error("Reservation non trouvee ou non annulable");
      }

      return bookingRepo.updateStatus(bookingId, {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      });
    },

    async getUserBookings(userId: string, status?: string) {
      return bookingRepo.findByUserId(userId, status);
    },

    async getSalonBookings(salonId: string, date?: string, staffId?: string) {
      return bookingRepo.findBySalon(salonId, date, staffId);
    },
  };
}

// Export type for interface
export type BookingService = ReturnType<typeof createBookingService>;
