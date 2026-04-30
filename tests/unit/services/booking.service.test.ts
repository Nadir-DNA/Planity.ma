/**
 * Booking Service Tests - Refactored with DI
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBookingService } from "@/server/services/booking.service.refactored";
import { createMockBookingRepository, createMockServiceRepository } from "../../mocks/mock-repositories";
import { createMockService, createMockBooking } from "../../factories";

describe("BookingService (DI)", () => {
  let bookingRepo: ReturnType<typeof createMockBookingRepository>;
  let serviceRepo: ReturnType<typeof createMockServiceRepository>;
  let bookingService: ReturnType<typeof createBookingService>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    bookingRepo = createMockBookingRepository();
    serviceRepo = createMockServiceRepository();
    bookingService = createBookingService({ bookingRepo, serviceRepo });
  });

  describe("createBooking", () => {
    it("should create booking with valid services", async () => {
      // Setup mock services
      const service1 = createMockService({ id: "svc-1", salonId: "salon-1", price: 100, duration: 30 });
      const service2 = createMockService({ id: "svc-2", salonId: "salon-1", price: 150, duration: 45 });
      
      vi.mocked(serviceRepo.findManyByIds).mockResolvedValue([service1, service2]);
      vi.mocked(bookingRepo.findByReference).mockResolvedValue(null);
      vi.mocked(bookingRepo.createBookingWithItems).mockResolvedValue(
        createMockBooking({ id: "booking-1", totalPrice: 250 }) as any
      );

      const result = await bookingService.createBooking({
        userId: "user-1",
        salonId: "salon-1",
        services: [{ serviceId: "svc-1" }, { serviceId: "svc-2" }],
        date: "2025-05-15",
        time: "14:00",
      });

      expect(serviceRepo.findManyByIds).toHaveBeenCalledWith(["svc-1", "svc-2"], "salon-1");
      expect(bookingRepo.createBookingWithItems).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw error if service not found", async () => {
      vi.mocked(serviceRepo.findManyByIds).mockResolvedValue([]);

      await expect(
        bookingService.createBooking({
          userId: "user-1",
          salonId: "salon-1",
          services: [{ serviceId: "svc-invalid" }],
          date: "2025-05-15",
          time: "14:00",
        })
      ).rejects.toThrow("Un ou plusieurs services sont invalides");
    });

    it("should generate unique reference if collision", async () => {
      const existingBooking = createMockBooking({ reference: "ABC123" });
      vi.mocked(serviceRepo.findManyByIds).mockResolvedValue([
        createMockService({ id: "svc-1", salonId: "salon-1" })
      ]);
      
      // First call returns existing, second returns null
      vi.mocked(bookingRepo.findByReference)
        .mockResolvedValueOnce(existingBooking)
        .mockResolvedValueOnce(null);
      
      vi.mocked(bookingRepo.createBookingWithItems).mockResolvedValue(createMockBooking() as any);

      await bookingService.createBooking({
        userId: "user-1",
        salonId: "salon-1",
        services: [{ serviceId: "svc-1" }],
        date: "2025-05-15",
        time: "14:00",
      });

      expect(bookingRepo.findByReference).toHaveBeenCalledTimes(2);
    });

    it("should calculate total price correctly", async () => {
      const service1 = createMockService({ id: "svc-1", price: 200, duration: 60 });
      const service2 = createMockService({ id: "svc-2", price: 100, duration: 30 });
      
      vi.mocked(serviceRepo.findManyByIds).mockResolvedValue([service1, service2]);
      vi.mocked(bookingRepo.findByReference).mockResolvedValue(null);
      vi.mocked(bookingRepo.createBookingWithItems).mockImplementation(async (params) => {
        expect(params.totalPrice).toBe(300);
        return createMockBooking({ totalPrice: params.totalPrice }) as any;
      });

      await bookingService.createBooking({
        userId: "user-1",
        salonId: "salon-1",
        services: [{ serviceId: "svc-1" }, { serviceId: "svc-2" }],
        date: "2025-05-15",
        time: "10:00",
      });
    });
  });

  describe("cancelBooking", () => {
    it("should cancel CONFIRMED booking", async () => {
      const booking = createMockBooking({ id: "booking-1", status: "CONFIRMED" });
      vi.mocked(bookingRepo.findCancellable).mockResolvedValue(booking);
      vi.mocked(bookingRepo.updateStatus).mockResolvedValue(
        createMockBooking({ status: "CANCELLED" }) as any
      );

      const result = await bookingService.cancelBooking("booking-1", "user-1", "Test reason");

      expect(bookingRepo.findCancellable).toHaveBeenCalledWith("booking-1", "user-1");
      expect(bookingRepo.updateStatus).toHaveBeenCalledWith("booking-1", {
        status: "CANCELLED",
        cancellationReason: "Test reason",
        cancelledAt: expect.any(Date),
        cancelledBy: "user-1",
      });
      expect(result.status).toBe("CANCELLED");
    });

    it("should throw error if booking not cancellable", async () => {
      vi.mocked(bookingRepo.findCancellable).mockResolvedValue(null);

      await expect(
        bookingService.cancelBooking("booking-invalid", "user-1")
      ).rejects.toThrow("Reservation non trouvee ou non annulable");
    });
  });

  describe("getUserBookings", () => {
    it("should return user bookings", async () => {
      const bookings = [
        createMockBooking({ userId: "user-1" }),
        createMockBooking({ userId: "user-1" }),
      ];
      vi.mocked(bookingRepo.findByUserId).mockResolvedValue(bookings);

      const result = await bookingService.getUserBookings("user-1");

      expect(bookingRepo.findByUserId).toHaveBeenCalledWith("user-1", undefined);
      expect(result).toHaveLength(2);
    });

    it("should filter by status", async () => {
      vi.mocked(bookingRepo.findByUserId).mockResolvedValue([]);

      await bookingService.getUserBookings("user-1", "CONFIRMED");

      expect(bookingRepo.findByUserId).toHaveBeenCalledWith("user-1", "CONFIRMED");
    });
  });

  describe("getSalonBookings", () => {
    it("should return salon bookings", async () => {
      const bookings = [createMockBooking({ salonId: "salon-1" })];
      vi.mocked(bookingRepo.findBySalon).mockResolvedValue(bookings);

      const result = await bookingService.getSalonBookings("salon-1");

      expect(result).toHaveLength(1);
    });

    it("should filter by date", async () => {
      vi.mocked(bookingRepo.findBySalon).mockResolvedValue([]);

      await bookingService.getSalonBookings("salon-1", "2025-05-15");

      expect(bookingRepo.findBySalon).toHaveBeenCalledWith("salon-1", "2025-05-15", undefined);
    });
  });
});
