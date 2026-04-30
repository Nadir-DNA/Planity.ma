
/**
 * Dependency Injection Container
 * Central factory for all services and repositories
 */

import { createSalonRepository, createBookingRepository } from "@/repositories";
import { SalonController, BookingController } from "@/controllers";
import { db } from "@/lib/db";

// ============================================================
// REPOSITORY IMPLEMENTATIONS (inline for missing ones)
// ============================================================

function createServiceRepository() {
  return {
    findById: async (id: string) => db.service.findUnique({ where: { id } }),
    findManyByIds: async (ids: string[], salonId: string) =>
      db.service.findMany({ where: { id: { in: ids }, salonId } }),
    findBySalon: async (salonId: string, activeOnly?: boolean) =>
      db.service.findMany({
        where: { salonId, isActive: activeOnly ? true : undefined },
      }),
    create: async (data: any) => db.service.create({ data }),
  };
}

function createReviewRepository() {
  return {
    findById: async (id: string) => db.review.findUnique({ where: { id } }),
    findBySalon: async (salonId: string, approvedOnly?: boolean) =>
      db.review.findMany({
        where: { salonId, status: approvedOnly ? "APPROVED" : undefined },
      }),
    findByUser: async (userId: string) => db.review.findMany({ where: { userId } }),
    create: async (data: any) => db.review.create({ data }),
    updateStatus: async (id: string, status: string) =>
      db.review.update({ where: { id }, data: { status: status as any } }),
    aggregateRating: async (salonId: string) => {
      const result = await db.review.aggregate({
        where: { salonId, status: "APPROVED" },
        _avg: { overallRating: true },
        _count: true,
      });
      return { avg: result._avg.overallRating || 0, count: result._count };
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
      salon: new SalonController({ salonRepo, reviewRepo }),
      booking: new BookingController({ bookingRepo, salonRepo, serviceRepo }),
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
      salon: new SalonController({ salonRepo, reviewRepo }),
      booking: new BookingController({ bookingRepo, salonRepo, serviceRepo }),
    },
  };
}
