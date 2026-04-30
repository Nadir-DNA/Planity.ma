/**
 * Test Database Helper
 * Provides isolated test database context for integration tests
 */

import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/utils";

export async function createTestUser(data?: Partial<{
  email: string;
  name: string;
  phone: string;
}>): Promise<{ id: string; email: string }> {
  const email = data?.email || `test-${Date.now()}@example.com`;
  
  const user = await db.user.create({
    data: {
      email,
      name: data?.name || "Test User",
      phone: data?.phone || "+212600000000",
    },
  });
  
  return user;
}

export async function createTestSalon(ownerId: string, data?: Partial<{
  name: string;
  slug: string;
  category: string;
  city: string;
}>): Promise<{ id: string; slug: string }> {
  const slug = data?.slug || `test-salon-${Date.now()}`;
  
  const salon = await db.salon.create({
    data: {
      name: data?.name || "Test Salon",
      slug,
      category: data?.category || "COIFFEUR",
      address: "123 Test Address",
      city: data?.city || "Casablanca",
      phone: "+212600000001",
      ownerId,
      isActive: true,
      isVerified: true,
    },
  });
  
  return salon;
}

export async function createTestService(salonId: string, data?: Partial<{
  name: string;
  price: number;
  duration: number;
}>): Promise<{ id: string }> {
  const service = await db.service.create({
    data: {
      salonId,
      name: data?.name || "Test Service",
      price: data?.price || 100,
      duration: data?.duration || 30,
      isActive: true,
    },
  });
  
  return service;
}

export async function createTestBooking(
  userId: string,
  salonId: string,
  data?: Partial<{
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    status: string;
  }>
): Promise<{ id: string; reference: string }> {
  const startTime = data?.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endTime = data?.endTime || new Date(startTime.getTime() + 30 * 60 * 1000);
  
  const booking = await db.booking.create({
    data: {
      reference: generateBookingReference(),
      userId,
      salonId,
      startTime,
      endTime,
      totalPrice: data?.totalPrice || 100,
      source: "ONLINE",
      status: data?.status || "CONFIRMED",
    },
  });
  
  return booking;
}

export async function cleanupTestUser(userId: string): Promise<void> {
  await db.notification.deleteMany({ where: { userId } });
  await db.booking.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } });
}

export async function cleanupTestSalon(salonId: string): Promise<void> {
  await db.service.deleteMany({ where: { salonId } });
  await db.booking.deleteMany({ where: { salonId } });
  await db.salon.delete({ where: { id: salonId } });
}

export async function cleanupTestData(prefix: string = "test-"): Promise<void> {
  // Clean all test data with prefix
  await db.notification.deleteMany({
    where: { title: { contains: prefix } },
  });
  
  await db.booking.deleteMany({
    where: { reference: { contains: prefix.toUpperCase() } },
  });
  
  await db.salon.deleteMany({
    where: { slug: { contains: prefix } },
  });
  
  await db.user.deleteMany({
    where: { email: { contains: prefix } },
  });
}
