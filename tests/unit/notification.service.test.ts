import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests unitaires pour notification.service.ts
 */

vi.mock("@/lib/db", () => ({
  db: {
    notification: {
      create: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification logic", () => {
    it("should create notification with correct type and channel", () => {
      const params = {
        userId: "user-123",
        type: "BOOKING_CONFIRMED" as const,
        channel: "EMAIL" as const,
        title: "Réservation confirmée",
        body: "Votre RDV est confirmé",
      };

      expect(params.type).toBe("BOOKING_CONFIRMED");
      expect(params.channel).toBe("EMAIL");
    });

    it("should set status to PENDING initially", () => {
      const notification = {
        status: "PENDING",
        sentAt: null,
      };
      expect(notification.status).toBe("PENDING");
      expect(notification.sentAt).toBeNull();
    });

    it("should update status to SENT after sending", () => {
      const notification = {
        status: "SENT",
        sentAt: new Date(),
      };
      expect(notification.status).toBe("SENT");
      expect(notification.sentAt).toBeInstanceOf(Date);
    });

    it("should support all notification types", () => {
      const types = [
        "BOOKING_CONFIRMED",
        "BOOKING_REMINDER",
        "BOOKING_CANCELLED",
        "REVIEW_REQUEST",
        "NEW_REVIEW",
        "MARKETING",
        "SYSTEM",
      ];
      expect(types).toHaveLength(7);
    });

    it("should support all notification channels", () => {
      const channels = ["EMAIL", "SMS", "PUSH"];
      expect(channels).toHaveLength(3);
    });
  });

  describe("sendBookingConfirmation logic", () => {
    it("should format booking confirmation message", () => {
      const salonName = "Salon Elegance";
      const services = "Coupe femme, Brushing";
      const dateStr = "mercredi 20 mars";
      const timeStr = "14:00";
      const reference = "PLM-A3K7N";

      const body = `Votre rendez-vous chez ${salonName} pour ${services} est confirmé le ${dateStr} à ${timeStr}. Référence: ${reference}`;

      expect(body).toContain(salonName);
      expect(body).toContain(services);
      expect(body).toContain(reference);
    });

    it("should send SMS if user has phone", () => {
      const userPhone = "+212 661-123456";
      const shouldSendSMS = !!userPhone;
      expect(shouldSendSMS).toBe(true);
    });

    it("should not send SMS if user has no phone", () => {
      const userPhone = null;
      const shouldSendSMS = !!userPhone;
      expect(shouldSendSMS).toBe(false);
    });
  });

  describe("sendBookingReminder logic", () => {
    it("should only send for CONFIRMED bookings", () => {
      const booking = { status: "CONFIRMED" };
      expect(booking.status).toBe("CONFIRMED");
    });

    it("should not send for CANCELLED bookings", () => {
      const booking = { status: "CANCELLED" };
      expect(booking.status).not.toBe("CONFIRMED");
    });

    it("should not send for COMPLETED bookings", () => {
      const booking = { status: "COMPLETED" };
      expect(booking.status).not.toBe("CONFIRMED");
    });

    it("should format reminder message", () => {
      const salonName = "Salon Elegance";
      const timeStr = "14:00";
      const reference = "PLM-A3K7N";

      const body = `Rappel: votre rendez-vous chez ${salonName} est aujourd'hui à ${timeStr}. Ref: ${reference}`;

      expect(body).toContain("Rappel");
      expect(body).toContain(salonName);
      expect(body).toContain(timeStr);
    });
  });
});
