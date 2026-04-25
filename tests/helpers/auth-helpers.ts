/**
 * Authentication helpers for tests.
 *
 * Provides utilities for creating authenticated sessions
 * and simulating different user roles.
 */
import bcrypt from "bcryptjs";
import { testDb } from "./db-setup";
import type { UserRole } from "@prisma/client";

/**
 * Create a test user with the given role and credentials.
 */
export async function createTestUser(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone: string;
  }> = {}
) {
  const {
    email = `testuser_${Date.now()}@example.com`,
    password = "TestPassword123!",
    name = "Test User",
    role = "CONSUMER",
    phone = null,
  } = overrides;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await testDb.user.create({
    data: {
      email,
      passwordHash,
      name,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || null,
      role,
      phone,
      provider: "EMAIL",
      locale: "FR",
    },
  });

  return { user, password };
}

/**
 * Create a salon owner user.
 */
export async function createTestOwner(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
) {
  return createTestUser({
    role: "PRO_OWNER",
    ...overrides,
  });
}

/**
 * Create a staff user.
 */
export async function createTestStaff(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
) {
  return createTestUser({
    role: "PRO_STAFF",
    ...overrides,
  });
}

/**
 * Create an admin user.
 */
export async function createTestAdmin(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
) {
  return createTestUser({
    role: "ADMIN",
    ...overrides,
  });
}

/**
 * Create a consumer user.
 */
export async function createTestConsumer(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
) {
  return createTestUser({
    role: "CONSUMER",
    ...overrides,
  });
}

/**
 * Create a session token for a user.
 */
export async function createSession(userId: string) {
  const session = await testDb.session.create({
    data: {
      sessionToken: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return session;
}

/**
 * Get a user by email.
 */
export async function getUserByEmail(email: string) {
  return testDb.user.findUnique({
    where: { email },
  });
}

/**
 * Delete a user and all associated data.
 */
export async function deleteUser(userId: string) {
  await testDb.session.deleteMany({ where: { userId } });
  await testDb.account.deleteMany({ where: { userId } });
  await testDb.user.delete({ where: { id: userId } });
}
