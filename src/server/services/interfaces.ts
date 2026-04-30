/**
 * Service Interfaces for DI
 * Uses plain types instead of Prisma-generated types
 */

// ============================================
// Booking Service Interface
// ============================================

export interface IBookingService {
  createBooking(params: {
    userId: string;
    salonId: string;
    services: { serviceId: string; staffId?: string }[];
    date: string;
    time: string;
    notes?: string;
  }): Promise<Record<string, unknown> & { items: Record<string, unknown>[] }>;
  
  cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Record<string, unknown>>;
  
  getUserBookings(userId: string, status?: string): Promise<Record<string, unknown>[]>;
  
  getSalonBookings(salonId: string, date?: string, staffId?: string): Promise<Record<string, unknown>[]>;
}

// ============================================
// Salon Service Interface
// ============================================

export interface ISalonService {
  createSalon(input: CreateSalonInput, ownerId: string): Promise<Record<string, unknown>>;
  
  getSalonBySlug(slug: string): Promise<Record<string, unknown> | null>;
  
  searchSalons(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ salons: Record<string, unknown>[]; total: number; page: number; totalPages: number }>;
  
  updateSalonRating(salonId: string): Promise<void>;
}

export interface CreateSalonInput {
  name: string;
  category: string;
  address: string;
  city: string;
  postalCode?: string;
  phone: string;
  email?: string;
  description?: string;
}

// ============================================
// Notification Service Interface
// ============================================

export interface INotificationService {
  createNotification(params: {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
  
  sendBookingConfirmation(bookingId: string): Promise<void>;
  
  sendBookingReminder(bookingId: string): Promise<void>;
  
  sendBookingCancellation(bookingId: string): Promise<void>;
}

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_REMINDER"
  | "BOOKING_CANCELLED"
  | "REVIEW_REQUEST"
  | "NEW_REVIEW"
  | "MARKETING"
  | "SYSTEM";

export type NotificationChannel = "EMAIL" | "SMS" | "PUSH";

// ============================================
// Dependencies Container
// ============================================

export interface ServiceDependencies {
  bookingService: IBookingService;
  salonService: ISalonService;
  notificationService: INotificationService;
}