/**
 * Mock Repository Factories for Testing
 */

import { vi } from "vitest";
import type { 
  IBookingRepository, ISalonRepository, IServiceRepository,
  IUserRepository, INotificationRepository, IReviewRepository 
} from "@/repositories/interfaces";
import { createMockBooking, createMockSalon, createMockService, createMockUser } from "../factories";

// ============================================
// Mock Booking Repository
// ============================================

export function createMockBookingRepository(): IBookingRepository {
  const bookings = new Map<string, ReturnType<typeof createMockBooking>>();
  
  return {
    findById: vi.fn(async (id) => bookings.get(id) || null),
    
    findByReference: vi.fn(async (ref) => {
      for (const b of bookings.values()) {
        if (b.reference === ref) return b;
      }
      return null;
    }),
    
    findByUserId: vi.fn(async (userId, status) => {
      const results = Array.from(bookings.values()).filter(b => b.userId === userId);
      return status ? results.filter(b => b.status === status) : results;
    }),
    
    findBySalon: vi.fn(async (salonId, date, staffId) => {
      const results = Array.from(bookings.values()).filter(b => b.salonId === salonId);
      return results;
    }),
    
    findCancellable: vi.fn(async (bookingId, userId) => {
      const b = bookings.get(bookingId);
      if (b && ["PENDING", "CONFIRMED"].includes(b.status)) return b;
      return null;
    }),
    
    createBookingWithItems: vi.fn(async (params) => {
      const booking = createMockBooking({
        id: `booking-${Date.now()}`,
        reference: params.reference,
        userId: params.userId,
        salonId: params.salonId,
        startTime: params.startTime,
        endTime: params.endTime,
        totalPrice: params.totalPrice,
        status: params.status,
      });
      bookings.set(booking.id, booking);
      return booking as any;
    }),
    
    updateStatus: vi.fn(async (bookingId, data) => {
      const b = bookings.get(bookingId);
      if (b) {
        Object.assign(b, data);
        return b;
      }
      throw new Error("Booking not found");
    }),
    
    checkConflict: vi.fn(async () => false),
  };
}

// ============================================
// Mock Salon Repository
// ============================================

export function createMockSalonRepository(): ISalonRepository {
  const salons = new Map<string, ReturnType<typeof createMockSalon>>();
  
  return {
    findById: vi.fn(async (id) => salons.get(id) || null),
    
    findBySlug: vi.fn(async (slug) => {
      for (const s of salons.values()) {
        if (s.slug === slug) return s;
      }
      return null;
    }),
    
    search: vi.fn(async (params) => {
      let results = Array.from(salons.values());
      
      if (params.city) {
        results = results.filter(s => s.city.toLowerCase().includes(params.city!.toLowerCase()));
      }
      if (params.category) {
        results = results.filter(s => s.category === params.category);
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        results = results.filter(s => 
          s.name.toLowerCase().includes(q) || 
          s.city.toLowerCase().includes(q)
        );
      }
      
      const total = results.length;
      const page = params.page || 1;
      const limit = params.limit || 20;
      const start = (page - 1) * limit;
      
      return {
        salons: results.slice(start, start + limit),
        total,
      };
    }),
    
    create: vi.fn(async (data) => {
      const salon = createMockSalon({
        id: `salon-${Date.now()}`,
        name: data.name,
        slug: data.slug,
        city: data.city,
        category: data.category,
      });
      salons.set(salon.id, salon);
      return salon;
    }),
    
    updateRating: vi.fn(async (salonId, avg, count) => {
      const s = salons.get(salonId);
      if (s) {
        s.averageRating = avg;
        s.reviewCount = count;
      }
    }),
    
    findByOwner: vi.fn(async (ownerId) => 
      Array.from(salons.values()).filter(s => s.ownerId === ownerId)
    ),
  };
}

// ============================================
// Mock Service Repository
// ============================================

export function createMockServiceRepository(): IServiceRepository {
  const services = new Map<string, ReturnType<typeof createMockService>>();
  
  return {
    findById: vi.fn(async (id) => services.get(id) || null),
    
    findManyByIds: vi.fn(async (ids, salonId) => {
      return Array.from(services.values())
        .filter(s => ids.includes(s.id) && s.salonId === salonId);
    }),
    
    findBySalon: vi.fn(async (salonId, activeOnly) => {
      let results = Array.from(services.values()).filter(s => s.salonId === salonId);
      if (activeOnly) results = results.filter(s => s.isActive);
      return results;
    }),
    
    create: vi.fn(async (data) => {
      const service = createMockService({
        id: `service-${Date.now()}`,
        salonId: data.salonId,
        name: data.name,
        price: data.price,
        duration: data.duration,
      });
      services.set(service.id, service);
      return service;
    }),
  };
}

// ============================================
// Mock User Repository
// ============================================

export function createMockUserRepository(): IUserRepository {
  const users = new Map<string, ReturnType<typeof createMockUser>>();
  
  return {
    findById: vi.fn(async (id) => users.get(id) || null),
    
    findByEmail: vi.fn(async (email) => {
      for (const u of users.values()) {
        if (u.email === email) return u;
      }
      return null;
    }),
    
    findByPhone: vi.fn(async (phone) => {
      for (const u of users.values()) {
        if (u.phone === phone) return u;
      }
      return null;
    }),
    
    create: vi.fn(async (data) => {
      const user = createMockUser({
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        phone: data.phone,
      });
      users.set(user.id, user);
      return user;
    }),
    
    update: vi.fn(async (id, data) => {
      const u = users.get(id);
      if (u) {
        Object.assign(u, data);
        return u;
      }
      throw new Error("User not found");
    }),
  };
}

// ============================================
// Mock Notification Repository
// ============================================

export function createMockNotificationRepository(): INotificationRepository {
  const notifications = new Map();
  
  return {
    create: vi.fn(async (params) => {
      const notification = {
        id: `notif-${Date.now()}`,
        ...params,
        createdAt: new Date(),
      };
      notifications.set(notification.id, notification);
      return notification;
    }),
    
    updateStatus: vi.fn(async (id, status, sentAt) => {
      const n = notifications.get(id);
      if (n) {
        n.status = status;
        if (sentAt) n.sentAt = sentAt;
        return n;
      }
      throw new Error("Notification not found");
    }),
    
    findByUser: vi.fn(async (userId, limit = 10) => {
      return Array.from(notifications.values())
        .filter(n => n.userId === userId)
        .slice(0, limit);
    }),
  };
}

// ============================================
// Full Mock Container
// ============================================

export function createMockRepositories() {
  return {
    booking: createMockBookingRepository(),
    salon: createMockSalonRepository(),
    service: createMockServiceRepository(),
    user: createMockUserRepository(),
    notification: createMockNotificationRepository(),
  };
}
