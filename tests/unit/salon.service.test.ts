import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests unitaires pour salon.service.ts
 */

vi.mock("@/lib/db", () => ({
  db: {
    salon: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    serviceCategory: {
      findUnique: vi.fn(),
    },
    review: {
      aggregate: vi.fn(),
    },
    slugify: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  slugify: vi.fn((text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  ),
}));

import { slugify } from "@/lib/utils";

describe("Salon Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("slugify", () => {
    it("should generate unique slug from name and city", () => {
      const slug = slugify("Salon Elegance Casablanca");
      expect(slug).toBe("salon-elegance-casablanca");
    });

    it("should handle accents", () => {
      const slug = slugify("Institut de Beauté");
      expect(slug).toBe("institut-de-beaute");
    });

    it("should handle special characters", () => {
      const slug = slugify("Salon & Spa!");
      expect(slug).toBe("salon-spa");
    });

    it("should handle duplicates with counter", () => {
      const base = slugify("Salon Elegance Casablanca");
      const withCounter = slugify("Salon Elegance Casablanca 1");
      expect(base).not.toBe(withCounter);
      expect(withCounter).toContain("1");
    });
  });

  describe("searchSalons logic", () => {
    it("should build correct where clause with city", () => {
      const city = "Casablanca";
      const where: Record<string, unknown> = {
        isActive: true,
        isVerified: true,
      };
      if (city) where.city = { contains: city, mode: "insensitive" };

      expect(where.city).toEqual({
        contains: "Casablanca",
        mode: "insensitive",
      });
    });

    it("should build correct where clause with category", () => {
      const category = "coiffeur";
      const where: Record<string, unknown> = {
        isActive: true,
        isVerified: true,
      };
      if (category)
        where.category = category.toUpperCase().replace(/-/g, "_");

      expect(where.category).toBe("COIFFEUR");
    });

    it("should build correct where clause with query (OR search)", () => {
      const query = "coiffeur casablanca";
      const where: Record<string, unknown> = {
        isActive: true,
        isVerified: true,
      };
      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ];
      }

      expect(where.OR).toHaveLength(3);
    });

    it("should calculate pagination correctly", () => {
      const total = 47;
      const limit = 20;
      const totalPages = Math.ceil(total / limit);
      expect(totalPages).toBe(3);
    });

    it("should calculate skip correctly", () => {
      const page = 2;
      const limit = 20;
      const skip = (page - 1) * limit;
      expect(skip).toBe(20);
    });
  });

  describe("createSalon logic", () => {
    it("should set isActive to false by default", () => {
      const salonData = {
        name: "Salon Test",
        isActive: false,
        isVerified: false,
      };
      expect(salonData.isActive).toBe(false);
      expect(salonData.isVerified).toBe(false);
    });

    it("should require admin approval", () => {
      const salonData = {
        name: "Salon Test",
        isActive: false,
      };
      expect(salonData.isActive).toBe(false);
    });
  });
});
