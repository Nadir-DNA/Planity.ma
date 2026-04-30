/**
 * Dependency Injection Container
 * Central factory for all services and repositories
 * Uses Supabase Admin REST API instead of Prisma
 */

import { supabaseAdmin, findById, findByUnique, findMany, findFirst, insertRow, updateRow, countRows } from "@/lib/supabase-helpers";
import { createSalonRepository, createBookingRepository } from "@/repositories";
import { SalonController, BookingController } from "@/controllers";

// ============================================================
// REPOSITORY IMPLEMENTATIONS (inline for missing ones)
// ============================================================

function createServiceRepository() {
  return {
    findById: async (id: string) => findById("Service", id),
    findManyByIds: async (ids: string[], salonId: string) => {
      const { data, error } = await supabaseAdmin
        .from("Service")
        .select("*")
        .in("id", ids)
        .eq("salonId", salonId);
      if (error) throw new Error(`findManyByIds: ${error.message}`);
      return data || [];
    },
    findBySalon: async (salonId: string, activeOnly?: boolean) => {
      let query = supabaseAdmin
        .from("Service")
        .select("*")
        .eq("salonId", salonId);
      if (activeOnly) query = query.eq("isActive", true);
      const { data, error } = await query;
      if (error) throw new Error(`findBySalon: ${error.message}`);
      return data || [];
    },
    create: async (data: Record<string, unknown>) => insertRow("Service", data),
  };
}

function createReviewRepository() {
  return {
    findById: async (id: string) => findById("Review", id),
    findBySalon: async (salonId: string, approvedOnly?: boolean) => {
      let query = supabaseAdmin
        .from("Review")
        .select("*")
        .eq("salonId", salonId);
      if (approvedOnly) query = query.eq("status", "APPROVED");
      const { data, error } = await query;
      if (error) throw new Error(`findBySalon reviews: ${error.message}`);
      return data || [];
    },
    findByUser: async (userId: string) => findMany("Review", { filters: { userId } }),
    create: async (data: Record<string, unknown>) => insertRow("Review", data),
    updateStatus: async (id: string, status: string) => updateRow("Review", id, { status }),
    aggregateRating: async (salonId: string) => {
      const { data: reviews, error } = await supabaseAdmin
        .from("Review")
        .select("overallRating")
        .eq("salonId", salonId)
        .eq("status", "APPROVED");

      if (error) throw new Error(`aggregateRating: ${error.message}`);
      const count = reviews?.length ?? 0;
      const avg = count > 0
        ? reviews!.reduce((sum: number, r: { overallRating: number }) => sum + r.overallRating, 0) / count
        : 0;
      return { avg, count };
    },
  };
}

// ============================================================
// CONTAINER
// ============================================================

export interface AppContainer {
  repositories: {
    salon: ReturnType<typeof createSalonRepository>;
    booking: ReturnType<typeof createBookingRepository>;
    service: ReturnType<typeof createServiceRepository>;
    review: ReturnType<typeof createReviewRepository>;
  };
  controllers: {
    salon: SalonController;
    booking: BookingController;
  };
}

// ============================================================
// FACTORY
// ============================================================

function createAppContainer(): AppContainer {
  const salonRepo = createSalonRepository();
  const bookingRepo = createBookingRepository();
  const serviceRepo = createServiceRepository();
  const reviewRepo = createReviewRepository();

  return {
    repositories: {
      salon: salonRepo,
      booking: bookingRepo,
      service: serviceRepo,
      review: reviewRepo,
    },
    controllers: {
      salon: new SalonController({ salonRepo: salonRepo as any, reviewRepo: reviewRepo as any }),
      booking: new BookingController({ bookingRepo: bookingRepo as any, salonRepo: salonRepo as any, serviceRepo: serviceRepo as any }),
    },
  };
}

// ============================================================
// SINGLETON
// ============================================================

let _container: AppContainer | null = null;

export function getContainer(): AppContainer {
  if (!_container) {
    _container = createAppContainer();
  }
  return _container;
}

export function resetContainer(): void {
  _container = null;
}

// ============================================================
// TEST UTILITIES
// ============================================================

export function createTestContainer(mocks?: Partial<AppContainer["repositories"]>): AppContainer {
  const salonRepo = mocks?.salon ?? createSalonRepository();
  const bookingRepo = mocks?.booking ?? createBookingRepository();
  const serviceRepo = mocks?.service ?? createServiceRepository();
  const reviewRepo = mocks?.review ?? createReviewRepository();

  return {
    repositories: {
      salon: salonRepo,
      booking: bookingRepo,
      service: serviceRepo,
      review: reviewRepo,
    },
    controllers: {
      salon: new SalonController({ salonRepo: salonRepo as any, reviewRepo: reviewRepo as any }),
      booking: new BookingController({ bookingRepo: bookingRepo as any, salonRepo: salonRepo as any, serviceRepo: serviceRepo as any }),
    },
  };
}