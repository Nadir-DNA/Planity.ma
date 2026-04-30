/**
 * Database Integration Tests with PostgreSQL testDb
 * Requires TEST_DATABASE_URL to be set
 * Skip if database not available
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";

// Check if test database is available
const hasTestDb = Boolean(
  process.env.TEST_DATABASE_URL || 
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("test"))
);

describe.runIf(hasTestDb)("Database Connection Integration", () => {
  beforeAll(async () => {
    try {
      await db.$connect();
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe("Health Check", () => {
    it("should connect to database", async () => {
      const result = await db.$queryRaw<{ result: number }[]>`SELECT 1 as result`;
      expect(result[0].result).toBe(1);
    });
  });

  describe("User Table Operations", () => {
    const testEmail = `test-${Date.now()}@integration.example.com`;
    let testUserId: string;

    afterAll(async () => {
      if (testUserId) {
        await db.booking.deleteMany({ where: { userId: testUserId } });
        await db.notification.deleteMany({ where: { userId: testUserId } });
        await db.user.delete({ where: { id: testUserId } }).catch(() => {});
      }
    });

    it("should create a user", async () => {
      const user = await db.user.create({
        data: {
          email: testEmail,
          name: "Test User",
          phone: "+212600000000",
        },
      });

      testUserId = user.id;
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);
    });

    it("should find user by email", async () => {
      const found = await db.user.findUnique({
        where: { email: testEmail },
      });

      expect(found).toBeDefined();
      expect(found?.email).toBe(testEmail);
    });

    it("should update user", async () => {
      const updated = await db.user.update({
        where: { id: testUserId },
        data: { name: "Updated Name" },
      });

      expect(updated.name).toBe("Updated Name");
    });

    it("should delete user", async () => {
      await db.booking.deleteMany({ where: { userId: testUserId } });
      await db.notification.deleteMany({ where: { userId: testUserId } });
      
      await db.user.delete({
        where: { id: testUserId },
      });

      const found = await db.user.findUnique({
        where: { id: testUserId },
      });

      expect(found).toBeNull();
      testUserId = "";
    });
  });
});

// Fallback: if no test database, skip silently
describe.skipIf(!hasTestDb)("Database (skipped)", () => {
  it("requires TEST_DATABASE_URL", () => {
    // Placeholder test
  });
});
