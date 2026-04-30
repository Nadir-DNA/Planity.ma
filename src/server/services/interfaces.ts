/**
 * Service Interfaces for DI
 */

import type { Booking, Salon, Service, User, Notification, BookingItem } from "@prisma/client";

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
  }): Promise<Booking & { items: BookingItem[] }>;
  
  cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking>;
  
  getUserBookings(userId: string, status?: string): Promise<Booking[]>;
  
  getSalonBookings(salonId: string, date?: string, staffId?: string): Promise<Booking[]>;
}

// ============================================
// Salon Service Interface
// ============================================

export interface ISalonService {
  createSalon(input: CreateSalonInput, ownerId: string): Promise<Salon>;
  
  getSalonBySlug(slug: string): Promise<Salon | null>;
  
  searchSalons(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ salons: Salon[]; total: number; page: number; totalPages: number }>;
  
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
  }): Promise<Notification>;
  
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
