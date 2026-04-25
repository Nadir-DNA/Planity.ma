/**
 * Database setup helper for tests.
 *
 * Provides a dedicated Prisma client for testing with automatic
 * cleanup between tests. Uses the TEST_DATABASE_URL environment
 * variable for isolation from development database.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Test database client - uses TEST_DATABASE_URL or falls back to DATABASE_URL
 */
export const testDb =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.TEST_DATABASE_URL ||
          process.env.DATABASE_URL ||
          "postgresql://planity:planity_dev@localhost:5432/planity_test",
      },
    },
    log: process.env.DEBUG_TESTS === "true" ? ["query", "error", "warn"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = testDb;
}

/**
 * Clean all tables in the correct order to avoid foreign key violations.
 * Call this in beforeEach to ensure a clean state.
 */
export async function cleanupDatabase(): Promise<void> {
  const tables = [
    "MarketingCampaign",
    "Notification",
    "LoyaltyTransaction",
    "LoyaltyCard",
    "Favorite",
    "Supplier",
    "Product",
    "GiftCardUsage",
    "GiftCard",
    "Payment",
    "Review",
    "BookingItem",
    "Booking",
    "ClockEvent",
    "StaffAbsence",
    "StaffSchedule",
    "StaffService",
    "StaffMember",
    "Service",
    "ServiceCategory",
    "OpeningHours",
    "SalonPhoto",
    "Salon",
    "Session",
    "Account",
    "VerificationToken",
    "User",
  ];

  // Disable foreign key checks temporarily
  await testDb.$executeRawUnsafe("SET CONSTRAINTS ALL DEFERRED");

  for (const table of tables) {
    try {
      await testDb.$executeRawUnsafe(
        `DELETE FROM "public"."${table}"`
      );
    } catch {
      // Table may not exist or may already be empty
    }
  }
}

/**
 * Reset sequences for auto-increment fields (if any).
 */
export async function resetSequences(): Promise<void> {
  // PostgreSQL sequences - only needed if using serial columns
  // Our schema uses cuid() so this is mostly a no-op
}

/**
 * Setup function to be called before all tests.
 */
export async function setupTestDatabase(): Promise<void> {
  // Verify connection
  await testDb.$connect();
  await testDb.$queryRaw`SELECT 1`;
}

/**
 * Teardown function to be called after all tests.
 */
export async function teardownTestDatabase(): Promise<void> {
  await testDb.$disconnect();
}
