
/**
 * Salon Controller
 */

import type { ISalonRepository, IReviewRepository } from "@/repositories/interfaces";
import { slugify } from "@/lib/utils";
import type { CreateSalonInput } from "@/server/validators/salon.schema";

export interface SalonControllerDeps {
  salonRepo: ISalonRepository;
  reviewRepo: IReviewRepository;
}

export class SalonController {
  constructor(private deps: SalonControllerDeps) {}

  async createSalon(input: CreateSalonInput, ownerId: string) {
    // Generate unique slug
    let slug = slugify(input.name + " " + input.city);
    let existing = await this.deps.salonRepo.findBySlug(slug);
    let counter = 1;

    while (existing) {
      slug = slugify(input.name + " " + input.city + " " + counter);
      existing = await this.deps.salonRepo.findBySlug(slug);
      counter++;
    }

    const salon = await this.deps.salonRepo.create({
      name: input.name,
      slug,
      category: input.category,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      phone: input.phone,
      email: input.email,
      description: input.description,
      ownerId,
      isActive: false,
    });

    return salon;
  }

  async getSalonBySlug(slug: string) {
    const salon = await this.deps.salonRepo.findBySlug(slug);
    
    if (!salon) return null;

    // Get aggregated reviews
    const { avg, count } = await this.deps.reviewRepo.aggregateRating(salon.id);

    return {
      ...salon,
      averageRating: avg || 0,
      reviewCount: count,
    };
  }

  async searchSalons(params: {
    query?: string;
    city?: string;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const { query, city, category, sortBy = "relevance", page = 1, limit = 20 } = params;

    const result = await this.deps.salonRepo.search({
      query,
      city,
      category,
      page,
      limit,
      isActive: true,
      isVerified: true,
    });

    return {
      salons: result.salons,
      total: result.total,
      page,
      limit,
    };
  }
}
