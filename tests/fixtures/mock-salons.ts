/**
 * Mock salon data for tests.
 *
 * Provides realistic test data for salon-related tests.
 */
import type { Salon, SalonCategory, OpeningHours } from "@prisma/client";

/**
 * Create a mock salon object (not persisted).
 */
export function createMockSalon(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    category: SalonCategory;
    city: string;
    isActive: boolean;
    isVerified: boolean;
    averageRating: number;
    reviewCount: number;
  }> = {}
): Partial<Salon> {
  const timestamp = Date.now();
  return {
    id: overrides.id || `salon_${timestamp}_${Math.random().toString(36).slice(2, 9)}`,
    name: overrides.name || "Salon Elegance",
    slug: overrides.slug || "salon-elegance-casablanca",
    description:
      "Salon de coiffure haut de gamme au coeur de Casablanca.",
    category: overrides.category || "COIFFEUR",
    address: "123 Boulevard Mohammed V",
    city: overrides.city || "Casablanca",
    postalCode: "20000",
    country: "MA",
    latitude: 33.5731,
    longitude: -7.5898,
    phone: "+212522000000",
    email: "contact@salon-elegance.ma",
    isActive: overrides.isActive ?? true,
    isVerified: overrides.isVerified ?? true,
    isPremium: false,
    averageRating: overrides.averageRating ?? 4.5,
    reviewCount: overrides.reviewCount ?? 127,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-01"),
    ...overrides,
  };
}

/**
 * Create mock opening hours for a salon.
 */
export function createMockOpeningHours(
  salonId: string
): Partial<OpeningHours>[] {
  const days = [
    { dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
    { dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
    { dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
    { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
    { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
    { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 6, openTime: "", closeTime: "", isClosed: true },
  ];

  return days.map((day) => ({
    id: `hours_${salonId}_${day.dayOfWeek}`,
    salonId,
    ...day,
  }));
}

/**
 * Array of mock salons for search/filtering tests.
 */
export const MOCK_SALONS: Partial<Salon>[] = [
  {
    id: "salon_001",
    name: "Salon Elegance",
    slug: "salon-elegance-casa",
    category: "COIFFEUR",
    city: "Casablanca",
    address: "123 Bd Mohammed V",
    isActive: true,
    isVerified: true,
    averageRating: 4.5,
    reviewCount: 127,
  },
  {
    id: "salon_002",
    name: "Barber King",
    slug: "barber-king-rabat",
    category: "BARBIER",
    city: "Rabat",
    address: "45 Avenue Hassan II",
    isActive: true,
    isVerified: true,
    averageRating: 4.8,
    reviewCount: 89,
  },
  {
    id: "salon_003",
    name: "Institut Beaute Royale",
    slug: "institut-beaute-royale-marrakech",
    category: "INSTITUT_BEAUTE",
    city: "Marrakech",
    address: "12 Rue de la Kasbah",
    isActive: true,
    isVerified: true,
    averageRating: 4.2,
    reviewCount: 56,
  },
  {
    id: "salon_004",
    name: "Spa Zen",
    slug: "spa-zen-tanger",
    category: "SPA",
    city: "Tanger",
    address: "8 Boulevard Pasteur",
    isActive: true,
    isVerified: false, // Not verified
    averageRating: 4.0,
    reviewCount: 34,
  },
  {
    id: "salon_005",
    name: "Ongles Paradise",
    slug: "ongles-paradise-casa",
    category: "ONGLES",
    city: "Casablanca",
    address: "67 Rue Allal Ben Abdellah",
    isActive: false, // Inactive
    isVerified: true,
    averageRating: 3.9,
    reviewCount: 22,
  },
  {
    id: "salon_006",
    name: "Maquillage Pro Studio",
    slug: "maquillage-pro-studio",
    category: "MAQUILLAGE",
    city: "Casablanca",
    address: "90 Avenue des FAR",
    isActive: true,
    isVerified: true,
    averageRating: 4.7,
    reviewCount: 201,
  },
];

/**
 * Mock services for a salon.
 */
export function createMockServices(salonId: string) {
  return [
    {
      id: `svc_${salonId}_001`,
      salonId,
      name: "Coupe femme",
      description: "Coupe et brushing inclus",
      price: 150,
      duration: 45,
      bufferTime: 15,
      isOnlineBookable: true,
      requiresDeposit: false,
      isActive: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `svc_${salonId}_002`,
      salonId,
      name: "Coupe homme",
      description: "Coupe classique",
      price: 80,
      duration: 30,
      bufferTime: 10,
      isOnlineBookable: true,
      requiresDeposit: false,
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `svc_${salonId}_003`,
      salonId,
      name: "Coloration complete",
      description: "Coloration professionnelle",
      price: 300,
      duration: 90,
      bufferTime: 30,
      isOnlineBookable: true,
      requiresDeposit: true,
      depositAmount: 100,
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `svc_${salonId}_004`,
      salonId,
      name: "Soin capillaire",
      description: "Traitement nourrissant",
      price: 200,
      duration: 60,
      bufferTime: 15,
      isOnlineBookable: true,
      requiresDeposit: false,
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `svc_${salonId}_005`,
      salonId,
      name: "Service inactif",
      description: "Ce service ne devrait pas apparaitre",
      price: 50,
      duration: 20,
      bufferTime: 0,
      isOnlineBookable: false,
      requiresDeposit: false,
      isActive: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
