/**
 * Test Factories - Generate mock data
 */

import type { Salon, Booking, Service, User } from "@prisma/client";

// ============================================================
// DATA FACTORIES
// ============================================================

export function createMockSalon(overrides?: Partial<Salon>): Salon {
  return {
    id: `salon-${Math.random().toString(36).slice(2)}`,
    name: "Test Salon",
    slug: "test-salon",
    description: "Test description",
    category: "COIFFEUR" as any,
    address: "123 Test Street",
    city: "Casablanca",
    postalCode: "20000",
    country: "MA",
    latitude: 33.5,
    longitude: -7.5,
    phone: "+212-123456789",
    email: "test@salon.ma",
    website: null,
    coverImage: null,
    logoImage: null,
    isActive: true,
    isVerified: true,
    isPremium: false,
    cancellationPolicy: null,
    depositPercentage: 0,
    stripeAccountId: null,
    averageRating: 4.5,
    reviewCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: "owner-1",
    ...overrides,
  } as Salon;
}

export function createMockBooking(overrides?: Partial<Booking>): Booking {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);
  const endTime = new Date(startTime.getTime() + 60 * 60000);
  
  return {
    id: `booking-${Math.random().toString(36).slice(2)}`,
    reference: "PLM-TEST1",
    userId: "user-1",
    salonId: "salon-1",
    status: "CONFIRMED" as any,
    startTime,
    endTime,
    totalPrice: 150,
    depositAmount: 0,
    depositPaid: false,
    notes: null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledBy: null,
    reminder24hSent: false,
    reminder1hSent: false,
    source: "ONLINE" as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Booking;
}

export function createMockService(overrides?: Partial<Service>): Service {
  return {
    id: `service-${Math.random().toString(36).slice(2)}`,
    salonId: "salon-1",
    name: "Test Service",
    description: "Test description",
    price: 100,
    duration: 60,
    bufferTime: 0,
    isOnlineBookable: true,
    requiresDeposit: false,
    depositAmount: null,
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: null,
    ...overrides,
  } as Service;
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: `user-${Math.random().toString(36).slice(2)}`,
    email: "test@example.com",
    phone: "+212-123456789",
    passwordHash: "hashed",
    name: "Test User",
    firstName: "Test",
    lastName: "User",
    avatar: null,
    role: "CONSUMER" as any,
    provider: "EMAIL" as any,
    locale: "FR" as any,
    emailVerified: new Date(),
    phoneVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

// ============================================================
// REPOSITORY MOCK FACTORIES (simplified for testing)
// ============================================================

export function createMockSalonRepository() {
  const salons: Salon[] = [];
  
  return {
    findById: async (id: string) => salons.find(s => s.id === id) || null,
    findBySlug: async (slug: string) => salons.find(s => s.slug === slug) || null,
    findMany: async (where?: any, options?: any) => salons,
    create: async (data: any) => {
      const salon = createMockSalon(data);
      salons.push(salon);
      return salon;
    },
    update: async (id: string, data: any) => {
      const idx = salons.findIndex(s => s.id === id);
      if (idx >= 0) {
        salons[idx] = { ...salons[idx], ...data };
        return salons[idx];
      }
      throw new Error("Salon not found");
    },
    count: async () => salons.length,
  };
}

export function createMockBookingRepository() {
  const bookings: Booking[] = [];
  
  return {
    findById: async (id: string) => bookings.find(b => b.id === id) || null,
    findByReference: async (ref: string) => bookings.find(b => b.reference === ref) || null,
    findMany: async (where?: any, options?: any) => bookings,
    create: async (data: any) => {
      const booking = createMockBooking(data);
      bookings.push(booking);
      return booking;
    },
    update: async (id: string, data: any) => {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx >= 0) {
        bookings[idx] = { ...bookings[idx], ...data };
        return bookings[idx];
      }
      throw new Error("Booking not found");
    },
    updateStatus: async (id: string, status: string, reason?: string) => {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx >= 0) {
        bookings[idx] = {
          ...bookings[idx],
          status: status as any,
          cancellationReason: reason,
          cancelledAt: status === "CANCELLED" ? new Date() : null,
        };
        return bookings[idx];
      }
      throw new Error("Booking not found");
    },
    count: async () => bookings.length,
    inTransaction: async (fn: any) => fn({
      create: async (data: any) => {
        const booking = createMockBooking(data);
        bookings.push(booking);
        return booking;
      },
      findFirst: async () => null,
    }),
  };
}

export function createMockServiceRepository() {
  const services: Service[] = [];
  
  return {
    findById: async (id: string) => services.find(s => s.id === id) || null,
    findMany: async (where?: any) => {
      if (where?.id?.in) {
        return services.filter(s => where.id.in.includes(s.id));
      }
      return services;
    },
    findBySalon: async (salonId: string, activeOnly?: boolean) => services,
  };
}
