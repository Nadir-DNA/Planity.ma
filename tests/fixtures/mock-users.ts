/**
 * Mock user data for tests.
 *
 * Provides realistic test data for user-related tests.
 */
import type { User, UserRole } from "@prisma/client";

/**
 * Create a mock user object.
 */
export function createMockUser(
  overrides: Partial<{
    id: string;
    email: string;
    phone: string;
    name: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar: string;
  }> = {}
): Partial<User> {
  const timestamp = Date.now();
  return {
    id: overrides.id || `user_${timestamp}_${Math.random().toString(36).slice(2, 9)}`,
    email: overrides.email || `user_${timestamp}@example.com`,
    phone: overrides.phone || null,
    passwordHash: null,
    name: overrides.name || "Test User",
    firstName: overrides.firstName || "Test",
    lastName: overrides.lastName || "User",
    avatar: overrides.avatar || null,
    role: overrides.role || "CONSUMER",
    provider: "EMAIL",
    locale: "FR",
    emailVerified: null,
    phoneVerified: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
    ...overrides,
  };
}

/**
 * Pre-defined mock users for common test scenarios.
 */
export const MOCK_USERS = {
  consumer: {
    id: "user_consumer_001",
    email: "fatima@example.com",
    phone: "+212600112233",
    name: "Fatima Zahri",
    firstName: "Fatima",
    lastName: "Zahri",
    role: "CONSUMER" as UserRole,
    provider: "EMAIL" as const,
    locale: "FR" as const,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-01"),
  },
  consumer2: {
    id: "user_consumer_002",
    email: "youssef@example.com",
    phone: "+212600445566",
    name: "Youssef Bennani",
    firstName: "Youssef",
    lastName: "Bennani",
    role: "CONSUMER" as UserRole,
    provider: "EMAIL" as const,
    locale: "FR" as const,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-06-01"),
  },
  owner: {
    id: "user_owner_001",
    email: "sara@salon-elegance.ma",
    phone: "+212600778899",
    name: "Sara Mansouri",
    firstName: "Sara",
    lastName: "Mansouri",
    role: "PRO_OWNER" as UserRole,
    provider: "EMAIL" as const,
    locale: "FR" as const,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-06-01"),
  },
  staff: {
    id: "user_staff_001",
    email: "karim@salon-elegance.ma",
    phone: "+212600112200",
    name: "Karim Berrada",
    firstName: "Karim",
    lastName: "Berrada",
    role: "PRO_STAFF" as UserRole,
    provider: "EMAIL" as const,
    locale: "FR" as const,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-06-01"),
  },
  admin: {
    id: "user_admin_001",
    email: "admin@planity.ma",
    phone: null,
    name: "Admin Planity",
    firstName: "Admin",
    lastName: "Planity",
    role: "ADMIN" as UserRole,
    provider: "EMAIL" as const,
    locale: "FR" as const,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  googleUser: {
    id: "user_google_001",
    email: "google.user@gmail.com",
    phone: null,
    name: "Google User",
    firstName: "Google",
    lastName: "User",
    role: "CONSUMER" as UserRole,
    provider: "GOOGLE" as const,
    locale: "FR" as const,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-06-01"),
  },
};

/**
 * Create mock staff members for a salon.
 */
export function createMockStaffMembers(salonId: string) {
  return [
    {
      id: `staff_${salonId}_001`,
      salonId,
      userId: "user_staff_001",
      displayName: "Sara M.",
      title: "Coiffeuse senior",
      bio: "10 ans d'experience en coiffure",
      color: "#EC4899",
      isActive: true,
      order: 0,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      id: `staff_${salonId}_002`,
      salonId,
      userId: null,
      displayName: "Karim B.",
      title: "Coloriste",
      bio: "Specialiste coloration",
      color: "#3B82F6",
      isActive: true,
      order: 1,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      id: `staff_${salonId}_003`,
      salonId,
      userId: null,
      displayName: "Nadia L.",
      title: "Coiffeuse",
      bio: null,
      color: "#10B981",
      isActive: true,
      order: 2,
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      id: `staff_${salonId}_004`,
      salonId,
      userId: null,
      displayName: "Inactif",
      title: "Ancien employe",
      bio: null,
      color: "#6B7280",
      isActive: false,
      order: 3,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-05-01"),
    },
  ];
}
