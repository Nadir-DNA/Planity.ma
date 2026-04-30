
/**
 * Salon Repository Implementation
 */

import { db } from "@/lib/db";
import type { Salon } from "@prisma/client";

export class SalonRepository {
  async findById(id: string): Promise<Salon | null> {
    return db.salon.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Salon | null> {
    return db.salon.findUnique({
      where: { slug },
      include: { openingHours: true, services: true, staff: true },
    });
  }

  async search(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<{ salons: Salon[]; total: number }> {
    const { query, city, category, page = 1, limit = 20, isActive, isVerified } = params;

    const where: any = {};
    
    if (isActive) where.isActive = true;
    if (isVerified) where.isVerified = true;
    
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    
    if (category) {
      where.category = category.toUpperCase().replace(/-/g, "_");
    }
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ];
    }

    const [salons, total] = await Promise.all([
      db.salon.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { averageRating: "desc" },
      }),
      db.salon.count({ where }),
    ]);

    return { salons, total };
  }

  async create(data: {
    name: string;
    slug: string;
    category: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    email?: string;
    description?: string;
    ownerId: string;
    isActive?: boolean;
  }): Promise<Salon> {
    return db.salon.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category as any,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        description: data.description,
        ownerId: data.ownerId,
        isActive: data.isActive ?? false,
        isVerified: false,
      },
    });
  }

  async updateRating(salonId: string, averageRating: number, reviewCount: number): Promise<void> {
    await db.salon.update({
      where: { id: salonId },
      data: { averageRating, reviewCount },
    });
  }

  async findByOwner(ownerId: string): Promise<Salon[]> {
    return db.salon.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export function createSalonRepository() {
  return new SalonRepository();
}
