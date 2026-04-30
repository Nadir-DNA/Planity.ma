/**
 * Booking Controller Tests - Proper unit tests with DI
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingController, createBookingController } from "@/controllers/booking.controller";
import type { BookingControllerDeps } from "@/controllers/booking.controller";
import { createMockBooking, createMockService } from "../../factories";

// Mock repositories
function createMockBookingRepository() {
  const bookings: any[] = [];
  
  return {
    findById: vi.fn(async (id) => bookings.find(b => b.id === id) || null),
    findByReference: vi.fn(async (ref) => bookings.find(b => b.reference === ref) || null),
    findMany: vi.fn(async () => bookings),
    create: vi.fn(async (data) => {
      const booking = { ...createMockBooking(), ...data, id: `booking-${Date.now()}` };
      bookings.push(booking);
      return booking;
    }),
    update: vi.fn(async (id, data) => {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx >= 0) {
        bookings[idx] = { ...bookings[idx], ...data };
        return bookings[idx];
      }
      throw new Error("Booking not found");
    }),
    updateStatus: vi.fn(async (id, status) => ({ id, status })),
    count: vi.fn(async () => bookings.length),
    inTransaction: vi.fn(async (fn) => fn({
      create: vi.fn(async (data) => {
        const booking = { ...createMockBooking(), ...data, id: `booking-${Date.now()}` };
        bookings.push(booking);
        return booking;
      }),
      findFirst: vi.fn(async () => null),
    })),
  };
}

function createMockServiceRepository() {
  const services: any[] = [];
  
  return {
    findById: vi.fn(async (id) => services.find(s => s.id === id) || null),
    findMany: vi.fn(async (where) => {
      if (where?.id?.in) {
        return services.filter(s => where.id.in.includes(s.id));
      }
      return services;
    }),
    findBySalon: vi.fn(async () => services),
  };
}

function createMockSalonRepository() {
  return {
    findById: vi.fn(async () => null),
    findBySlug: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async (data) => ({ ...data, id: `salon-${Date.now()}` })),
    update: vi.fn(async () => null),
    count: vi.fn(async () => 0),
  };
}

describe("BookingController", () => {
  let controller: BookingController;
  let mockDeps: BookingControllerDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockDeps = {
      bookingRepo: createMockBookingRepository(),
      salonRepo: createMockSalonRepository(),
      serviceRepo: createMockServiceRepository(),
    };
    controller = createBookingController(mockDeps);
  });

  describe("createBooking", () => {
    it("should create a booking with valid input", async () => {
      // Seed mock services
      const service1 = createMockService({ id: "svc-1", salonId: "salon-1", price: 100, duration: 60 });
      const service2 = createMockService({ id: "svc-2", salonId: "salon-1", price: 50, duration: 30 });
      
      mockDeps.serviceRepo.findMany.mockResolvedValueOnce([service1, service2]);

      const result = await controller.createBooking({
        userId: "user-1",
        salonId: "salon-1",
        services: [{ serviceId: "svc-1" }, { serviceId: "svc-2" }],
        date: "2024-03-20",
        time: "14:00",
      });

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking?.totalPrice).toBe(150);
      expect(result.booking?.status).toBe("PENDING");
    });

    it("should fail if services not found", async () => {
      mockDeps.serviceRepo.findMany.mockResolvedValueOnce([]);

      const result = await controller.createBooking({
        userId: "user-1",
        salonId: "salon-1",
        services: [{ serviceId: "svc-invalid" }],
        date: "2024-03-20",
        time: "14:00",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Un ou plusieurs services sont invalides");
    });
  });

  describe("getBookings", () => {
    it("should return bookings with pagination", async () => {
      mockDeps.bookingRepo.findMany.mockResolvedValueOnce([
        createMockBooking({ userId: "user-1" }),
        createMockBooking({ userId: "user-1" }),
      ]);
      mockDeps.bookingRepo.count.mockResolvedValueOnce(2);

      const result = await controller.getBookings({ userId: "user-1", page: 1, limit: 10 });

      expect(result.bookings).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking successfully", async () => {
      const booking = createMockBooking({ id: "booking-1", userId: "user-1", status: "CONFIRMED" });
      
      mockDeps.bookingRepo.findById.mockResolvedValueOnce(booking);
      mockDeps.bookingRepo.updateStatus.mockResolvedValueOnce({ ...booking, status: "CANCELLED" });

      const result = await controller.cancelBooking("booking-1", "user-1", "Change of plans");

      expect(result.success).toBe(true);
      expect(result.booking?.status).toBe("CANCELLED");
    });

    it("should fail if booking not found", async () => {
      mockDeps.bookingRepo.findById.mockResolvedValueOnce(null);

      const result = await controller.cancelBooking("booking-404", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Réservation introuvable");
    });

    it("should fail if user is not owner", async () => {
      const booking = createMockBooking({ id: "booking-1", userId: "user-other" });
      
      mockDeps.bookingRepo.findById.mockResolvedValueOnce(booking);

      const result = await controller.cancelBooking("booking-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });
  });
});
