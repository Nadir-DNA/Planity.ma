/**
 * Repository Interfaces for DI
 */

import type { 
  Booking, BookingItem, Salon, Service, StaffMember, User, 
  Review, Notification, OpeningHours, SalonPhoto 
} from "@prisma/client";

// ============================================
// Booking Repository Interface
// ============================================

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  
  findByReference(reference: string): Promise<Booking | null>;
  
  findByUserId(userId: string, status?: string): Promise<Booking[]>;
  
  findBySalon(salonId: string, date?: string, staffId?: string): Promise<Booking[]>;
  
  findCancellable(bookingId: string, userId: string): Promise<Booking | null>;
  
  createBookingWithItems(params: {
    reference: string;
    userId: string;
    salonId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    source: string;
    status: string;
    notes?: string;
    items: Array<{
      serviceId: string;
      staffId: string;
      startTime: Date;
      endTime: Date;
      price: number;
    }>;
    services: Array<{ serviceId: string; staffId?: string }>;
    endTimeCheck: Date;
  }): Promise<Booking & { items: BookingItem[] }>;
  
  updateStatus(bookingId: string, data: {
    status: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
  }): Promise<Booking>;
  
  checkConflict(staffId: string, startTime: Date, endTime: Date): Promise<boolean>;
}

// ============================================
// Salon Repository Interface
// ============================================

export interface ISalonRepository {
  findById(id: string): Promise<Salon | null>;
  
  findBySlug(slug: string): Promise<Salon | null>;
  
  search(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<{ salons: Salon[]; total: number }>;
  
  create(data: {
    name: string;
    slug: string;
    category: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    email?: string;
    description?: string;
    ownerId: string;
    isActive?: boolean;
  }): Promise<Salon>;
  
  updateRating(salonId: string, averageRating: number, reviewCount: number): Promise<void>;
  
  findByOwner(ownerId: string): Promise<Salon[]>;
}

// ============================================
// Service Repository Interface
// ============================================

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  
  findManyByIds(ids: string[], salonId: string): Promise<Service[]>;
  
  findBySalon(salonId: string, activeOnly?: boolean): Promise<Service[]>;
  
  create(data: {
    salonId: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    categoryId?: string;
  }): Promise<Service>;
}

// ============================================
// User Repository Interface
// ============================================

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  
  findByEmail(email: string): Promise<User | null>;
  
  findByPhone(phone: string): Promise<User | null>;
  
  create(data: {
    name?: string;
    email: string;
    phone?: string;
    passwordHash?: string;
  }): Promise<User>;
  
  update(id: string, data: Partial<User>): Promise<User>;
}

// ============================================
// Notification Repository Interface
// ============================================

export interface INotificationRepository {
  create(params: {
    userId: string;
    type: string;
    channel: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    status: string;
  }): Promise<Notification>;
  
  updateStatus(id: string, status: string, sentAt?: Date): Promise<Notification>;
  
  findByUser(userId: string, limit?: number): Promise<Notification[]>;
}

// ============================================
// Review Repository Interface
// ============================================

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  
  findBySalon(salonId: string, approvedOnly?: boolean): Promise<Review[]>;
  
  findByUser(userId: string): Promise<Review[]>;
  
  create(data: {
    salonId: string;
    userId: string;
    bookingId?: string;
    overallRating: number;
    serviceRating?: number;
    atmosphereRating?: number;
    cleanlinessRating?: number;
    comment?: string;
  }): Promise<Review>;
  
  updateStatus(id: string, status: string): Promise<Review>;
  
  aggregateRating(salonId: string): Promise<{ avg: number; count: number }>;
}
