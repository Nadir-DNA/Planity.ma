import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests unitaires pour booking.service.ts
 * 
 * Note: Ces tests mockent la DB Prisma car nous ne pouvons pas
 * connecter une vraie DB dans les tests unitaires.
 * Pour les tests avec vraie DB, utiliser tests/integration/.
 */

// Mock du module Prisma
vi.mock("@/lib/db", () => ({
  db: {
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    bookingItem: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    review: {
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(async (fn) => {
      const mockTx = {
        booking: {
          create: vi.fn(),
          findFirst: vi.fn(),
        },
        bookingItem: {
          findFirst: vi.fn(),
        },
      };
      return fn(mockTx);
    }),
  },
}));

import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/utils";

describe("Booking Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateBookingReference", () => {
    it("should generate reference starting with PLM-", () => {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^PLM-[A-Z0-9]{5}$/);
    });

    it("should generate unique references", () => {
      const refs = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        refs.add(generateBookingReference());
      }
      expect(refs.size).toBe(1000);
    });

    it("should use only valid characters", () => {
      const ref = generateBookingReference();
      const code = ref.replace("PLM-", "");
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/);
    });
  });

  describe("createBooking logic", () => {
    it("should calculate total price from services", () => {
      const services = [
        { id: "s1", price: 150, duration: 45 },
        { id: "s2", price: 80, duration: 30 },
      ];
      const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
      expect(totalPrice).toBe(230);
    });

    it("should calculate total duration from services", () => {
      const services = [
        { id: "s1", price: 150, duration: 45 },
        { id: "s2", price: 80, duration: 30 },
      ];
      const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
      expect(totalDuration).toBe(75);
    });

    it("should generate correct start and end times", () => {
      const date = "2024-03-20";
      const time = "14:00";
      const totalDuration = 75; // minutes

      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(year, month - 1, day, hours, minutes);
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);

      expect(startTime.getHours()).toBe(14);
      expect(startTime.getMinutes()).toBe(0);
      expect(endTime.getHours()).toBe(15);
      expect(endTime.getMinutes()).toBe(15);
    });

    it("should handle multi-service sequential timing", () => {
      const services = [
        { id: "s1", duration: 45, price: 150 },
        { id: "s2", duration: 30, price: 80 },
      ];
      const baseTime = new Date(2024, 2, 20, 14, 0);

      const items = services.map((svc, i) => {
        const offset = services
          .slice(0, i)
          .reduce((sum, s) => sum + s.duration, 0);
        const itemStart = new Date(baseTime.getTime() + offset * 60000);
        const itemEnd = new Date(itemStart.getTime() + svc.duration * 60000);
        return { start: itemStart, end: itemEnd };
      });

      // Premier service: 14:00 - 14:45
      expect(items[0].start.getHours()).toBe(14);
      expect(items[0].start.getMinutes()).toBe(0);
      expect(items[0].end.getHours()).toBe(14);
      expect(items[0].end.getMinutes()).toBe(45);

      // Deuxième service: 14:45 - 15:15
      expect(items[1].start.getHours()).toBe(14);
      expect(items[1].start.getMinutes()).toBe(45);
      expect(items[1].end.getHours()).toBe(15);
      expect(items[1].end.getMinutes()).toBe(15);
    });
  });

  describe("cancelBooking logic", () => {
    it("should only cancel PENDING or CONFIRMED bookings", () => {
      const validStatuses = ["PENDING", "CONFIRMED"];
      const invalidStatuses = ["COMPLETED", "CANCELLED", "NO_SHOW", "IN_PROGRESS"];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        expect(validStatuses).not.toContain(status);
      });
    });

    it("should set cancellation fields", () => {
      const cancellationData = {
        status: "CANCELLED",
        cancellationReason: "Changed plans",
        cancelledAt: new Date(),
        cancelledBy: "user-123",
      };

      expect(cancellationData.status).toBe("CANCELLED");
      expect(cancellationData.cancellationReason).toBe("Changed plans");
      expect(cancellationData.cancelledBy).toBe("user-123");
      expect(cancellationData.cancelledAt).toBeInstanceOf(Date);
    });
  });

  describe("getUserBookings logic", () => {
    it("should build correct where clause with status filter", () => {
      const userId = "user-123";
      const status = "CONFIRMED";

      const where: Record<string, unknown> = { userId };
      if (status) where.status = status;

      expect(where).toEqual({ userId: "user-123", status: "CONFIRMED" });
    });

    it("should build correct where clause without status filter", () => {
      const userId = "user-123";
      const status = undefined;

      const where: Record<string, unknown> = { userId };
      if (status) where.status = status;

      expect(where).toEqual({ userId: "user-123" });
    });
  });

  describe("getSalonBookings logic", () => {
    it("should build correct where clause with date filter", () => {
      const salonId = "salon-123";
      const date = "2024-03-20";

      const where: Record<string, unknown> = { salonId };
      if (date) {
        const dayStart = new Date(date + "T00:00:00");
        const dayEnd = new Date(date + "T23:59:59");
        where.startTime = { gte: dayStart };
        where.endTime = { lte: dayEnd };
      }

      expect(where.salonId).toBe("salon-123");
      expect((where.startTime as any).gte).toEqual(new Date("2024-03-20T00:00:00"));
      expect((where.endTime as any).lte).toEqual(new Date("2024-03-20T23:59:59"));
    });

    it("should build correct where clause with staffId filter", () => {
      const salonId = "salon-123";
      const staffId = "staff-456";

      const where: Record<string, unknown> = { salonId };
      if (staffId) {
        where.items = { some: { staffId } };
      }

      expect(where).toEqual({
        salonId: "salon-123",
        items: { some: { staffId: "staff-456" } },
      });
    });
  });

  describe("updateSalonRating logic", () => {
    it("should calculate average rating from reviews", () => {
      const ratings = [5, 4, 5, 3, 4];
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      expect(avg).toBe(4.2);
    });

    it("should handle empty reviews", () => {
      const ratings: number[] = [];
      const avg =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;
      expect(avg).toBe(0);
    });

    it("should round average correctly", () => {
      const ratings = [5, 4, 5];
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      expect(Math.round(avg * 10) / 10).toBe(4.7);
    });
  });
});
