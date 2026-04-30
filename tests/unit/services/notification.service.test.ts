/**
 * Notification Service Tests - Refactored with DI
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNotificationService } from "@/server/services/notification.service.refactored";
import { 
  createMockNotificationRepository, 
  createMockUserRepository,
  createMockBookingRepository 
} from "../../mocks/mock-repositories";
import { createMockBooking, createMockUser } from "../../factories";

describe("NotificationService (DI)", () => {
  let notificationRepo: ReturnType<typeof createMockNotificationRepository>;
  let userRepo: ReturnType<typeof createMockUserRepository>;
  let bookingRepo: ReturnType<typeof createMockBookingRepository>;
  let emailSender: { send: ReturnType<typeof vi.fn> };
  let smsSender: { send: ReturnType<typeof vi.fn> };
  let notificationService: ReturnType<typeof createNotificationService>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    notificationRepo = createMockNotificationRepository();
    userRepo = createMockUserRepository();
    bookingRepo = createMockBookingRepository();
    
    emailSender = { send: vi.fn() };
    smsSender = { send: vi.fn() };
    
    notificationService = createNotificationService({
      notificationRepo,
      userRepo,
      bookingRepo,
      emailSender,
      smsSender,
    });
  });

  describe("createNotification", () => {
    it("should create notification with PENDING status", async () => {
      vi.mocked(notificationRepo.create).mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
        status: "PENDING",
        createdAt: new Date(),
      });
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({ id: "notif-1", status: "SENT" } as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser({ email: "test@example.com" }));
      vi.mocked(emailSender.send).mockResolvedValue(undefined as any);

      const result = await notificationService.createNotification({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
      });

      expect(notificationRepo.create).toHaveBeenCalledWith({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
        data: undefined,
        status: "PENDING",
      });
      
      // Status updated to SENT after sending
      expect(notificationRepo.updateStatus).toHaveBeenCalledWith("notif-1", "SENT", expect.any(Date));
    });

    it("should update status to SENT after successful email send", async () => {
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({ status: "SENT" } as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser({ email: "test@example.com" }));
      vi.mocked(emailSender.send).mockResolvedValue(undefined as any);

      await notificationService.createNotification({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
      });

      expect(notificationRepo.updateStatus).toHaveBeenCalledWith("notif-1", "SENT", expect.any(Date));
    });

    it("should update status to FAILED on error", async () => {
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser({ email: "test@example.com" }));
      vi.mocked(emailSender.send).mockRejectedValue(new Error("Email failed"));
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({ status: "FAILED" } as any);

      await notificationService.createNotification({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
      });

      expect(notificationRepo.updateStatus).toHaveBeenCalledWith("notif-1", "FAILED");
    });

    it("should send SMS via smsSender", async () => {
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({ status: "SENT" } as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser({ phone: "+212600000000" }));

      await notificationService.createNotification({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "SMS",
        title: "Test",
        body: "SMS body",
      });

      expect(smsSender.send).toHaveBeenCalledWith({
        to: "+212600000000",
        body: "SMS body",
      });
    });

    it("should skip email if user has no email", async () => {
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({ status: "SENT" } as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser({ email: null }));

      await notificationService.createNotification({
        userId: "user-1",
        type: "BOOKING_CONFIRMED",
        channel: "EMAIL",
        title: "Test",
        body: "Test body",
      });

      expect(emailSender.send).not.toHaveBeenCalled();
    });

    it("should handle all notification types", async () => {
      const types = [
        "BOOKING_CONFIRMED",
        "BOOKING_REMINDER",
        "BOOKING_CANCELLED",
        "REVIEW_REQUEST",
        "NEW_REVIEW",
        "MARKETING",
        "SYSTEM",
      ];

      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);
      vi.mocked(userRepo.findById).mockResolvedValue(createMockUser());

      for (const type of types) {
        await notificationService.createNotification({
          userId: "user-1",
          type: type as any,
          channel: "EMAIL",
          title: "Test",
          body: "Test",
        });
      }

      expect(notificationRepo.create).toHaveBeenCalledTimes(types.length);
    });
  });

  describe("sendBookingConfirmation", () => {
    it("should send confirmation email and SMS", async () => {
      const booking = createMockBooking({ 
        id: "booking-1",
        userId: "user-1",
        reference: "PLM-TEST",
        totalPrice: 200,
        startTime: new Date("2025-05-15T14:00:00"),
      });
      const user = createMockUser({ id: "user-1", phone: "+212600000000" });

      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);
      vi.mocked(userRepo.findById).mockResolvedValue(user);
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);

      await notificationService.sendBookingConfirmation("booking-1");

      // Should create email notification
      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          type: "BOOKING_CONFIRMED",
          channel: "EMAIL",
        })
      );

      // Should create SMS notification (user has phone)
      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "SMS",
        })
      );
    });

    it("should skip SMS if user has no phone", async () => {
      const booking = createMockBooking({ userId: "user-1" });
      const user = createMockUser({ id: "user-1", phone: null });

      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);
      vi.mocked(userRepo.findById).mockResolvedValue(user);
      vi.mocked(notificationRepo.create).mockResolvedValue({} as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);

      await notificationService.sendBookingConfirmation("booking-1");

      // Should only create EMAIL notification
      const calls = vi.mocked(notificationRepo.create).mock.calls;
      expect(calls.every(c => c[0].channel === "EMAIL")).toBe(true);
    });

    it("should return early if booking not found", async () => {
      vi.mocked(bookingRepo.findById).mockResolvedValue(null);

      await notificationService.sendBookingConfirmation("nonexistent");

      expect(notificationRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("sendBookingReminder", () => {
    it("should send reminder for CONFIRMED booking", async () => {
      const booking = createMockBooking({ 
        id: "booking-1",
        userId: "user-1", 
        status: "CONFIRMED",
        reference: "PLM-REMINDER",
        startTime: new Date(),
      });
      const user = createMockUser({ id: "user-1", phone: "+212600000000" });

      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);
      vi.mocked(userRepo.findById).mockResolvedValue(user);
      vi.mocked(notificationRepo.create).mockResolvedValue({} as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);

      await notificationService.sendBookingReminder("booking-1");

      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "BOOKING_REMINDER",
          channel: "SMS",
        })
      );
    });

    it("should skip if booking not CONFIRMED", async () => {
      const booking = createMockBooking({ status: "CANCELLED" });
      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);

      await notificationService.sendBookingReminder("booking-1");

      expect(notificationRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("sendBookingCancellation", () => {
    it("should send cancellation email", async () => {
      const booking = createMockBooking({
        id: "booking-1",
        userId: "user-1",
        reference: "PLM-CANCEL",
        cancellationReason: "Client request",
      });

      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);
      vi.mocked(notificationRepo.create).mockResolvedValue({} as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);

      await notificationService.sendBookingCancellation("booking-1");

      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "BOOKING_CANCELLED",
          channel: "EMAIL",
        })
      );
    });

    it("should include cancellation reason in email", async () => {
      const booking = createMockBooking({ cancellationReason: "Emergency" });
      vi.mocked(bookingRepo.findById).mockResolvedValue(booking);
      vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
      vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);

      await notificationService.sendBookingCancellation("booking-1");
      
      // Check that create was called with email containing reason
      const createCall = vi.mocked(notificationRepo.create).mock.calls[0][0];
      expect(createCall.body).toContain("Emergency");
    });
  });
});

describe("NotificationService without senders", () => {
  it("should work without emailSender", async () => {
    const notificationRepo = createMockNotificationRepository();
    const userRepo = createMockUserRepository();
    const bookingRepo = createMockBookingRepository();
    
    const service = createNotificationService({
      notificationRepo,
      userRepo,
      bookingRepo,
    });

    vi.mocked(notificationRepo.create).mockResolvedValue({ id: "notif-1" } as any);
    vi.mocked(notificationRepo.updateStatus).mockResolvedValue({} as any);
    vi.mocked(userRepo.findById).mockResolvedValue(createMockUser());

    // Should still create notification, just log instead of send
    await service.createNotification({
      userId: "user-1",
      type: "BOOKING_CONFIRMED",
      channel: "EMAIL",
      title: "Test",
      body: "Test",
    });

    expect(notificationRepo.create).toHaveBeenCalled();
  });
});
