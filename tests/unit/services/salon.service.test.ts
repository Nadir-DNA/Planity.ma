/**
 * Salon Service Tests - Refactored with DI
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSalonRepository, createMockServiceRepository } from "../../mocks/mock-repositories";
import { createMockSalon, createMockService } from "../../factories";

// Mock salon service factory (will be replaced with actual refactored version)
function createSalonService(deps: { salonRepo: any; serviceRepo: any }) {
  const { salonRepo, serviceRepo } = deps;
  
  return {
    async createSalon(input: any, ownerId: string) {
      let slug = input.name.toLowerCase().replace(/\s+/g, "-") + "-" + input.city.toLowerCase();
      
      let existing = await salonRepo.findBySlug(slug);
      let counter = 1;
      while (existing) {
        slug = `${slug}-${counter}`;
        existing = await salonRepo.findBySlug(slug);
        counter++;
      }
      
      return salonRepo.create({
        name: input.name,
        slug,
        category: input.category,
        address: input.address,
        city: input.city,
        phone: input.phone,
        ownerId,
        isActive: false,
      });
    },
    
    async getSalonBySlug(slug: string) {
      return salonRepo.findBySlug(slug);
    },
    
    async searchSalons(params: any) {
      const { salons, total } = await salonRepo.search(params);
      const page = params.page || 1;
      const limit = params.limit || 20;
      return { salons, total, page, totalPages: Math.ceil(total / limit) };
    },
    
    async updateSalonRating(salonId: string) {
      // Mock aggregation logic
      await salonRepo.updateRating(salonId, 4.5, 10);
    },
  };
}

describe("SalonService (DI)", () => {
  let salonRepo: ReturnType<typeof createMockSalonRepository>;
  let serviceRepo: ReturnType<typeof createMockServiceRepository>;
  let salonService: ReturnType<typeof createSalonService>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    salonRepo = createMockSalonRepository();
    serviceRepo = createMockServiceRepository();
    salonService = createSalonService({ salonRepo, serviceRepo });
  });

  describe("createSalon", () => {
    it("should create salon with unique slug", async () => {
      vi.mocked(salonRepo.findBySlug).mockResolvedValue(null);
      vi.mocked(salonRepo.create).mockResolvedValue(
        createMockSalon({ name: "Test Salon", slug: "test-salon-casablanca" })
      );

      const result = await salonService.createSalon({
        name: "Test Salon",
        category: "COIFFEUR",
        address: "123 Rue Test",
        city: "Casablanca",
        phone: "+212600000000",
      }, "owner-1");

      expect(salonRepo.findBySlug).toHaveBeenCalled();
      expect(salonRepo.create).toHaveBeenCalled();
      expect(result.slug).toContain("test-salon");
    });

    it("should append counter if slug collision", async () => {
      vi.mocked(salonRepo.findBySlug)
        .mockResolvedValueOnce(createMockSalon()) // First slug exists
        .mockResolvedValueOnce(null); // Modified slug doesn't exist
      
      vi.mocked(salonRepo.create).mockResolvedValue(createMockSalon());

      await salonService.createSalon({
        name: "Existing Salon",
        category: "COIFFEUR",
        address: "Test",
        city: "Rabat",
        phone: "+212600000000",
      }, "owner-1");

      expect(salonRepo.findBySlug).toHaveBeenCalledTimes(2);
    });
  });

  describe("getSalonBySlug", () => {
    it("should return salon by slug", async () => {
      const salon = createMockSalon({ slug: "test-salon" });
      vi.mocked(salonRepo.findBySlug).mockResolvedValue(salon);

      const result = await salonService.getSalonBySlug("test-salon");

      expect(result).toEqual(salon);
    });

    it("should return null if not found", async () => {
      vi.mocked(salonRepo.findBySlug).mockResolvedValue(null);

      const result = await salonService.getSalonBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("searchSalons", () => {
    it("should search with filters", async () => {
      const salons = [createMockSalon({ city: "Casablanca" })];
      vi.mocked(salonRepo.search).mockResolvedValue({ salons, total: 1 });

      const result = await salonService.searchSalons({
        city: "Casablanca",
        page: 1,
        limit: 20,
      });

      expect(salonRepo.search).toHaveBeenCalledWith({
        city: "Casablanca",
        page: 1,
        limit: 20,
      });
      expect(result.salons).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should calculate totalPages", async () => {
      vi.mocked(salonRepo.search).mockResolvedValue({ salons: [], total: 45 });

      const result = await salonService.searchSalons({ limit: 10 });

      expect(result.totalPages).toBe(5);
    });
  });

  describe("updateSalonRating", () => {
    it("should update salon rating", async () => {
      vi.mocked(salonRepo.updateRating).mockResolvedValue();

      await salonService.updateSalonRating("salon-1");

      expect(salonRepo.updateRating).toHaveBeenCalledWith("salon-1", expect.any(Number), expect.any(Number));
    });
  });
});
