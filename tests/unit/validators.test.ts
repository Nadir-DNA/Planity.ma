import { describe, it, expect } from "vitest";
import { createBookingSchema, cancelBookingSchema } from "@/server/validators/booking.schema";
import { createSalonSchema, createServiceSchema } from "@/server/validators/salon.schema";

describe("Booking Validators", () => {
  describe("createBookingSchema", () => {
    it("should validate correct booking data", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1", staffId: "staff-1" }],
        date: "2024-03-20",
        time: "14:00",
        notes: "Test booking",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing salonId", () => {
      const data = {
        salonId: "",
        services: [{ serviceId: "svc-1" }],
        date: "2024-03-20",
        time: "14:00",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty services", () => {
      const data = {
        salonId: "salon-123",
        services: [],
        date: "2024-03-20",
        time: "14:00",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1" }],
        date: "20/03/2024",
        time: "14:00",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid time format", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1" }],
        date: "2024-03-20",
        time: "2pm",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional staffId", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1" }],
        date: "2024-03-20",
        time: "14:00",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional notes", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1" }],
        date: "2024-03-20",
        time: "14:00",
        notes: undefined,
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject notes over 500 chars", () => {
      const data = {
        salonId: "salon-123",
        services: [{ serviceId: "svc-1" }],
        date: "2024-03-20",
        time: "14:00",
        notes: "x".repeat(501),
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("cancelBookingSchema", () => {
    it("should validate correct cancel data", () => {
      const data = {
        bookingId: "booking-123",
        reason: "Changed plans",
      };
      const result = cancelBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing bookingId", () => {
      const data = { bookingId: "" };
      const result = cancelBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional reason", () => {
      const data = { bookingId: "booking-123" };
      const result = cancelBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe("Salon Validators", () => {
  describe("createSalonSchema", () => {
    it("should validate correct salon data", () => {
      const data = {
        name: "Salon Elegance",
        category: "COIFFEUR",
        address: "123 Bd Mohammed V",
        city: "Casablanca",
        phone: "+212522123456",
        email: "contact@salon.ma",
        description: "Un beau salon",
      };
      const result = createSalonSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const data = {
        name: "A",
        category: "COIFFEUR",
        address: "123 Bd Mohammed V",
        city: "Casablanca",
        phone: "+212522123456",
      };
      const result = createSalonSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid category", () => {
      const data = {
        name: "Salon Elegance",
        category: "INVALID",
        address: "123 Bd Mohammed V",
        city: "Casablanca",
        phone: "+212522123456",
      };
      const result = createSalonSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject short address", () => {
      const data = {
        name: "Salon Elegance",
        category: "COIFFEUR",
        address: "Ab",
        city: "Casablanca",
        phone: "+212522123456",
      };
      const result = createSalonSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject short phone", () => {
      const data = {
        name: "Salon Elegance",
        category: "COIFFEUR",
        address: "123 Bd Mohammed V",
        city: "Casablanca",
        phone: "123",
      };
      const result = createSalonSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid categories", () => {
      const categories = [
        "COIFFEUR", "BARBIER", "INSTITUT_BEAUTE", "SPA",
        "ONGLES", "MAQUILLAGE", "EPILATION", "MASSAGE", "AUTRE",
      ];
      categories.forEach((category) => {
        const data = {
          name: "Salon",
          category,
          address: "123 Bd Mohammed V",
          city: "Casablanca",
          phone: "+212522123456",
        };
        const result = createSalonSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("createServiceSchema", () => {
    it("should validate correct service data", () => {
      const data = {
        salonId: "salon-123",
        name: "Coupe femme",
        price: 150,
        duration: 45,
        description: "Coupe et coiffage",
        categoryId: "cat-1",
        isOnlineBookable: true,
      };
      const result = createServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject negative price", () => {
      const data = {
        salonId: "salon-123",
        name: "Coupe",
        price: -10,
        duration: 30,
      };
      const result = createServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject short duration", () => {
      const data = {
        salonId: "salon-123",
        name: "Coupe",
        price: 100,
        duration: 3,
      };
      const result = createServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
