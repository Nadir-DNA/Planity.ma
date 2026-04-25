/**
 * Comprehensive test data factory.
 *
 * Provides factory functions to create complete test datasets
 * including users, salons, services, staff, and bookings.
 */
import { testDb } from "../helpers/db-setup";
import { createMockSalon, createMockServices, createMockOpeningHours } from "./mock-salons";
import { createMockUser, MOCK_USERS } from "./mock-users";
import { createMockBooking, MOCK_BOOKINGS } from "./mock-bookings";
import type { SalonCategory, UserRole } from "@prisma/client";

/**
 * Result of seeding test data.
 */
export interface TestDataSet {
  user: { id: string; email: string; password: string };
  owner: { id: string; email: string; password: string };
  salon: { id: string; slug: string; name: string };
  services: { id: string; name: string; price: number; duration: number }[];
  staff: { id: string; displayName: string }[];
  bookings: { id: string; reference: string; status: string }[];
}

/**
 * Seed a complete test dataset into the database.
 *
 * Creates: user, owner, salon with services, staff with schedules, and bookings.
 */
export async function seedTestData(
  options: {
    salonCategory?: SalonCategory;
    salonCity?: string;
    numServices?: number;
    numStaff?: number;
    numBookings?: number;
  } = {}
): Promise<TestDataSet> {
  const {
    salonCategory = "COIFFEUR",
    salonCity = "Casablanca",
    numServices = 4,
    numStaff = 3,
    numBookings = 2,
  } = options;

  // Create consumer user
  const consumerPassword = "Test123!";
  const consumer = await testDb.user.create({
    data: {
      email: `test_consumer_${Date.now()}@example.com`,
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi",
      name: "Test Consumer",
      firstName: "Test",
      lastName: "Consumer",
      role: "CONSUMER",
      provider: "EMAIL",
      locale: "FR",
    },
  });

  // Create owner
  const ownerPassword = "Owner123!";
  const owner = await testDb.user.create({
    data: {
      email: `test_owner_${Date.now()}@example.com`,
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi",
      name: "Test Owner",
      firstName: "Test",
      lastName: "Owner",
      role: "PRO_OWNER",
      provider: "EMAIL",
      locale: "FR",
    },
  });

  // Create salon
  const salonSlug = `test-salon-${Date.now()}`;
  const salon = await testDb.salon.create({
    data: {
      name: `Test Salon ${Date.now()}`,
      slug: salonSlug,
      description: "Salon de test pour les tests automatiques",
      category: salonCategory,
      address: "123 Rue de Test",
      city: salonCity,
      postalCode: "20000",
      phone: "+212522000001",
      email: `test@salon-${Date.now()}.ma`,
      isActive: true,
      isVerified: true,
      ownerId: owner.id,
    },
  });

  // Create opening hours
  for (let day = 0; day < 7; day++) {
    await testDb.openingHours.create({
      data: {
        salonId: salon.id,
        dayOfWeek: day,
        openTime: day === 6 ? "" : "09:00",
        closeTime: day === 6 ? "" : day === 5 ? "20:00" : "19:00",
        isClosed: day === 6,
      },
    });
  }

  // Create services
  const servicesData = [
    { name: "Coupe femme", price: 150, duration: 45, bufferTime: 15 },
    { name: "Coupe homme", price: 80, duration: 30, bufferTime: 10 },
    { name: "Coloration", price: 300, duration: 90, bufferTime: 30 },
    { name: "Brushing", price: 100, duration: 30, bufferTime: 10 },
    { name: "Soin capillaire", price: 200, duration: 60, bufferTime: 15 },
  ];

  const createdServices = await Promise.all(
    servicesData.slice(0, numServices).map((svc, index) =>
      testDb.service.create({
        data: {
          salonId: salon.id,
          ...svc,
          order: index,
        },
      })
    )
  );

  // Create staff members
  const staffNames = [
    { displayName: "Staff A", title: "Senior", color: "#EC4899" },
    { displayName: "Staff B", title: "Junior", color: "#3B82F6" },
    { displayName: "Staff C", title: "Specialiste", color: "#10B981" },
    { displayName: "Staff D", title: "Coiffeur", color: "#F59E0B" },
  ];

  const createdStaff = await Promise.all(
    staffNames.slice(0, numStaff).map((staff, index) =>
      testDb.staffMember.create({
        data: {
          salonId: salon.id,
          ...staff,
          order: index,
        },
      })
    )
  );

  // Create staff schedules (Mon-Sat 9-19)
  for (const staff of createdStaff) {
    for (let day = 0; day < 6; day++) {
      await testDb.staffSchedule.create({
        data: {
          staffId: staff.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "19:00",
          isWorking: true,
        },
      });
    }
  }

  // Assign all services to all staff
  for (const staff of createdStaff) {
    for (const service of createdServices) {
      await testDb.staffService.create({
        data: {
          staffId: staff.id,
          serviceId: service.id,
        },
      });
    }
  }

  // Create some bookings
  const createdBookings = [];
  const bookingStatuses = ["CONFIRMED", "COMPLETED", "PENDING"] as const;

  for (let i = 0; i < numBookings; i++) {
    const service = createdServices[i % createdServices.length];
    const staff = createdStaff[i % createdStaff.length];
    const baseDate = new Date("2024-06-15");
    baseDate.setDate(baseDate.getDate() + i);

    const booking = await testDb.booking.create({
      data: {
        reference: `PLM-${Math.random().toString(36).toUpperCase().slice(2, 7)}`,
        userId: consumer.id,
        salonId: salon.id,
        status: bookingStatuses[i % bookingStatuses.length],
        startTime: new Date(baseDate.setHours(10 + i * 2, 0, 0, 0)),
        endTime: new Date(
          baseDate.setHours(10 + i * 2, 0, 0, 0) + service.duration * 60000
        ),
        totalPrice: service.price,
        source: "ONLINE",
        items: {
          create: {
            serviceId: service.id,
            staffId: staff.id,
            startTime: new Date(baseDate.setHours(10 + i * 2, 0, 0, 0)),
            endTime: new Date(
              baseDate.setHours(10 + i * 2, 0, 0, 0) + service.duration * 60000
            ),
            price: service.price,
          },
        },
      },
    });
    createdBookings.push(booking);
  }

  return {
    user: { id: consumer.id, email: consumer.email!, password: consumerPassword },
    owner: { id: owner.id, email: owner.email!, password: ownerPassword },
    salon: { id: salon.id, slug: salon.slug, name: salon.name },
    services: createdServices.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
    })),
    staff: createdStaff.map((s) => ({
      id: s.id,
      displayName: s.displayName,
    })),
    bookings: createdBookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
    })),
  };
}

/**
 * Create a minimal test dataset (just user + salon).
 */
export async function seedMinimalTestData() {
  const consumer = await testDb.user.create({
    data: {
      email: `minimal_${Date.now()}@example.com`,
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi",
      name: "Minimal Test",
      role: "CONSUMER",
      provider: "EMAIL",
      locale: "FR",
    },
  });

  const owner = await testDb.user.create({
    data: {
      email: `minimal_owner_${Date.now()}@example.com`,
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi",
      name: "Minimal Owner",
      role: "PRO_OWNER",
      provider: "EMAIL",
      locale: "FR",
    },
  });

  const salon = await testDb.salon.create({
    data: {
      name: `Minimal Salon ${Date.now()}`,
      slug: `minimal-salon-${Date.now()}`,
      category: "COIFFEUR",
      address: "1 Rue Test",
      city: "Casablanca",
      isActive: true,
      isVerified: true,
      ownerId: owner.id,
    },
  });

  return { consumer, owner, salon };
}
