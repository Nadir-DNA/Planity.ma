/**
 * Repository Interfaces for DI
 * Uses plain types instead of Prisma-generated types
 */

// ============================================
// Booking Repository Interface
// ============================================

export interface IBookingRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  
  findByReference(reference: string): Promise<Record<string, unknown> | null>;
  
  findByUserId(userId: string, status?: string): Promise<Record<string, unknown>[]>;
  
  findBySalon(salonId: string, date?: string, staffId?: string): Promise<Record<string, unknown>[]>;
  
  findCancellable(bookingId: string, userId: string): Promise<Record<string, unknown> | null>;
  
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
  }): Promise<Record<string, unknown>>;
  
  updateStatus(bookingId: string, data: {
    status: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
  }): Promise<Record<string, unknown>>;
  
  checkConflict(staffId: string, startTime: Date, endTime: Date): Promise<boolean>;
}

// ============================================
// Salon Repository Interface
// ============================================

export interface ISalonRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  
  findBySlug(slug: string): Promise<Record<string, unknown> | null>;
  
  search(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<{ salons: Record<string, unknown>[]; total: number }>;
  
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
  }): Promise<Record<string, unknown>>;
  
  updateRating(salonId: string, averageRating: number, reviewCount: number): Promise<void>;
  
  findByOwner(ownerId: string): Promise<Record<string, unknown>[]>;
}

// ============================================
// Service Repository Interface
// ============================================

export interface IServiceRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  
  findManyByIds(ids: string[], salonId: string): Promise<Record<string, unknown>[]>;
  
  findBySalon(salonId: string, activeOnly?: boolean): Promise<Record<string, unknown>[]>;
  
  create(data: {
    salonId: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    categoryId?: string;
  }): Promise<Record<string, unknown>>;
}

// ============================================
// User Repository Interface
// ============================================

export interface IUserRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  
  findByEmail(email: string): Promise<Record<string, unknown> | null>;
  
  findByPhone(phone: string): Promise<Record<string, unknown> | null>;
  
  create(data: {
    name?: string;
    email: string;
    phone?: string;
    passwordHash?: string;
  }): Promise<Record<string, unknown>>;
  
  update(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
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
  }): Promise<Record<string, unknown>>;
  
  updateStatus(id: string, status: string, sentAt?: Date): Promise<Record<string, unknown>>;
  
  findByUser(userId: string, limit?: number): Promise<Record<string, unknown>[]>;
}

// ============================================
// Review Repository Interface
// ============================================

export interface IReviewRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  
  findBySalon(salonId: string, approvedOnly?: boolean): Promise<Record<string, unknown>[]>;
  
  findByUser(userId: string): Promise<Record<string, unknown>[]>;
  
  create(data: {
    salonId: string;
    userId: string;
    bookingId?: string;
    overallRating: number;
    serviceRating?: number;
    atmosphereRating?: number;
    cleanlinessRating?: number;
    comment?: string;
  }): Promise<Record<string, unknown>>;
  
  updateStatus(id: string, status: string): Promise<Record<string, unknown>>;
  
  aggregateRating(salonId: string): Promise<{ avg: number; count: number }>;
}