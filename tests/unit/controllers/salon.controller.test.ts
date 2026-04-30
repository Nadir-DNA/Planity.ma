/**
 * Salon Controller Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SalonController, createSalonController } from "@/controllers/salon.controller";
import type { SalonControllerDeps } from "@/controllers/salon.controller";
import { createMockSalon } from "../../factories";

// Mock slugify
vi.mock("@/lib/utils", () => ({
  slugify: vi.fn((text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  ),
}));

function createMockSalonRepository() {
  const salons: any[] = [];
  
  return {
    findById: vi.fn(async (id) => salons.find(s => s.id === id) || null),
    findBySlug: vi.fn(async (slug) => salons.find(s => s.slug === slug) || null),
    findMany: vi.fn(async () => salons),
    create: vi.fn(async (data) => {
      const salon = { ...createMockSalon(), ...data, id: `salon-${Date.now()}` };
      salons.push(salon);
      return salon;
    }),
    update: vi.fn(async (id, data) => {
      const idx = salons.findIndex(s => s.id === id);
      if (idx >= 0) {
        salons[idx] = { ...salons[idx], ...data };
        return salons[idx];
      }
      throw new Error("Salon not found");
    }),
    count: vi.fn(async () => salons.length),
  };
}

function createMockReviewRepository() {
  return {
    findById: vi.fn(async () => null),
    findBySalon: vi.fn(async () => []),
    create: vi.fn(async (data) => data),
    aggregate: vi.fn(async () => ({
      _avg: { overallRating: 4.5 },
      _count: 10,
    })),
  };
}

describe("SalonController", () => {
  let controller: SalonController;
  let mockDeps: SalonControllerDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockDeps = {
      salonRepo: createMockSalonRepository(),
      reviewRepo: createMockReviewRepository(),
    };
    controller = createSalonController(mockDeps);
  });

  describe("createSalon", () => {
    it("should create salon with unique slug", async () => {
      const input = {
        name: "Salon Elegance",
        category: "COIFFEUR",
        address: "123 Rue Mohammed V",
        city: "Casablanca",
      };

      mockDeps.salonRepo.findBySlug.mockResolvedValueOnce(null);

      const salon = await controller.createSalon(input, "owner-1");

      expect(salon.name).toBe("Salon Elegance");
      expect(salon.slug).toBe("salon-elegance-casablanca");
      expect(salon.isActive).toBe(false);
    });

    it("should handle duplicate slug", async () => {
      mockDeps.salonRepo.findBySlug
        .mockResolvedValueOnce(createMockSalon({ slug: "salon-test-casablanca" }))
        .mockResolvedValueOnce(null);

      const input = {
        name: "Salon Test",
        category: "COIFFEUR",
        address: "Test Address",
        city: "Casablanca",
      };

      const salon = await controller.createSalon(input, "owner-1");

      expect(salon.slug).toBe("salon-test-casablanca-1");
    });
  });

  describe("getSalonBySlug", () => {
    it("should return salon with review stats", async () => {
      const mockSalon = createMockSalon({ slug: "test-salon" });
      mockDeps.salonRepo.findBySlug.mockResolvedValueOnce(mockSalon);

      const result = await controller.getSalonBySlug("test-salon");

      expect(result).toBeDefined();
      expect(result?.slug).toBe("test-salon");
    });

    it("should return null if not found", async () => {
      mockDeps.salonRepo.findBySlug.mockResolvedValueOnce(null);

      const result = await controller.getSalonBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("searchSalons", () => {
    it("should search with filters", async () => {
      mockDeps.salonRepo.findMany.mockResolvedValueOnce([createMockSalon()]);
      mockDeps.salonRepo.count.mockResolvedValueOnce(1);

      const result = await controller.searchSalons({ city: "Casablanca" });

      expect(result.salons).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
