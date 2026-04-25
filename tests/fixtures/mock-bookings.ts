/**
 * Mock booking data for tests.
 *
 * Provides realistic test data for booking-related tests.
 */
import type { Booking, BookingItem, BookingStatus, BookingSource } from "@prisma/client";

/**
 * Create a mock booking object.
 */
export function createMockBooking(
  overrides: Partial<{
    id: string;
    reference: string;
    userId: string;
    salonId: string;
    status: BookingStatus;
    source: BookingSource;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    depositAmount: number;
    notes: string;
  }> = {}
): Partial<Booking> {
  const startTime =
    overrides.startTime || new Date("2024-06-15T10:00:00");
  const endTime =
    overrides.endTime ||
    new Date(startTime.getTime() + 45 * 60000); // 45 min default

  return {
    id: overrides.id || `booking_${Date.now()}`,
    reference: overrides.reference || "PLM-ABCDE",
    userId: overrides.userId || "user_001",
    salonId: overrides.salonId || "salon_001",
    status: overrides.status || "CONFIRMED",
    startTime,
    endTime,
    totalPrice: overrides.totalPrice ?? 150,
    depositAmount: overrides.depositAmount ?? 0,
    depositPaid: false,
    notes: overrides.notes || null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledBy: null,
    source: overrides.source || "ONLINE",
    createdAt: new Date("2024-06-10T14:30:00"),
    updatedAt: new Date("2024-06-10T14:30:00"),
    ...overrides,
  };
}

/**
 * Create mock booking items.
 */
export function createMockBookingItems(
  bookingId: string,
  salonId: string,
  staffId: string
): Partial<BookingItem>[] {
  const baseTime = new Date("2024-06-15T10:00:00");

  return [
    {
      id: `item_${bookingId}_001`,
      bookingId,
      serviceId: `svc_${salonId}_001`,
      staffId,
      startTime: baseTime,
      endTime: new Date(baseTime.getTime() + 45 * 60000),
      price: 150,
    },
  ];
}

/**
 * Array of mock bookings for various test scenarios.
 */
export const MOCK_BOOKINGS: Partial<Booking>[] = [
  {
    id: "booking_001",
    reference: "PLM-AAAAA",
    userId: "user_001",
    salonId: "salon_001",
    status: "CONFIRMED",
    startTime: new Date("2024-06-15T10:00:00"),
    endTime: new Date("2024-06-15T10:45:00"),
    totalPrice: 150,
    source: "ONLINE",
    createdAt: new Date("2024-06-10"),
    updatedAt: new Date("2024-06-10"),
  },
  {
    id: "booking_002",
    reference: "PLM-BBBBB",
    userId: "user_001",
    salonId: "salon_001",
    status: "COMPLETED",
    startTime: new Date("2024-06-10T14:00:00"),
    endTime: new Date("2024-06-10T15:30:00"),
    totalPrice: 450,
    source: "ONLINE",
    createdAt: new Date("2024-06-05"),
    updatedAt: new Date("2024-06-10"),
  },
  {
    id: "booking_003",
    reference: "PLM-CCCCC",
    userId: "user_002",
    salonId: "salon_001",
    status: "PENDING",
    startTime: new Date("2024-06-16T09:00:00"),
    endTime: new Date("2024-06-16T09:30:00"),
    totalPrice: 80,
    source: "IN_SALON",
    createdAt: new Date("2024-06-14"),
    updatedAt: new Date("2024-06-14"),
  },
  {
    id: "booking_004",
    reference: "PLM-DDDDD",
    userId: "user_001",
    salonId: "salon_002",
    status: "CANCELLED",
    startTime: new Date("2024-06-12T11:00:00"),
    endTime: new Date("2024-06-12T11:45:00"),
    totalPrice: 150,
    source: "ONLINE",
    cancellationReason: "Changement de programme",
    cancelledAt: new Date("2024-06-11"),
    cancelledBy: "user_001",
    createdAt: new Date("2024-06-08"),
    updatedAt: new Date("2024-06-11"),
  },
  {
    id: "booking_005",
    reference: "PLM-EEEEE",
    userId: "user_003",
    salonId: "salon_001",
    status: "NO_SHOW",
    startTime: new Date("2024-06-08T16:00:00"),
    endTime: new Date("2024-06-08T16:30:00"),
    totalPrice: 80,
    source: "PHONE",
    createdAt: new Date("2024-06-07"),
    updatedAt: new Date("2024-06-08"),
  },
];

/**
 * Helper to create bookings for availability conflict testing.
 */
export function createConflictBookings(
  salonId: string,
  staffId: string
): { id: string; startTime: Date; endTime: Date }[] {
  return [
    {
      id: "conflict_booking_001",
      startTime: new Date("2024-06-15T10:00:00"),
      endTime: new Date("2024-06-15T11:00:00"),
    },
    {
      id: "conflict_booking_002",
      startTime: new Date("2024-06-15T14:00:00"),
      endTime: new Date("2024-06-15T15:30:00"),
    },
  ];
}
