/**
 * Salon Repository Implementation
 * Uses Supabase Admin REST API instead of Prisma
 */

import { supabaseAdmin, findById, findByUnique, findMany, countRows, insertRow, updateRow } from "@/lib/supabase-helpers";

export class SalonRepository {
  async findById(id: string) {
    return findById("Salon", id);
  }

  async findBySlug(slug: string) {
    // Prisma include: openingHours, services, staff — needs separate fetches or join string
    const { data, error } = await supabaseAdmin
      .from("Salon")
      .select(`
        *,
        openingHours:OpeningHours(*),
        services:Service(*),
        staff:StaffMember(*)
      `)
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`findBySlug: ${error.message}`);
    }
    return data;
  }

  async search(params: {
    query?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<{ salons: unknown[]; total: number }> {
    const { query, city, category, page = 1, limit = 20, isActive, isVerified } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let qb = supabaseAdmin
      .from("Salon")
      .select("*", { count: "exact" });

    if (isActive) qb = qb.eq("isActive", true);
    if (isVerified) qb = qb.eq("isVerified", true);
    if (city) qb = qb.ilike("city", `%${city}%`);
    if (category) qb = qb.eq("category", category.toUpperCase().replace(/-/g, "_"));
    if (query) {
      // Supabase doesn't support OR with ilike in a single call easily,
      // so we use .or() with ilike
      qb = qb.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
    }

    qb = qb.order("averageRating", { ascending: false }).range(from, to);

    const { data, count, error } = await qb;
    if (error) throw new Error(`Salon search: ${error.message}`);

    return { salons: data || [], total: count ?? 0 };
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
  }) {
    return insertRow("Salon", {
      name: data.name,
      slug: data.slug,
      category: data.category.toUpperCase().replace(/-/g, "_"),
      address: data.address,
      city: data.city,
      postalCode: data.postalCode || null,
      phone: data.phone,
      email: data.email || null,
      description: data.description || null,
      ownerId: data.ownerId,
      isActive: data.isActive ?? false,
      isVerified: false,
    });
  }

  async updateRating(salonId: string, averageRating: number, reviewCount: number): Promise<void> {
    await updateRow("Salon", salonId, { averageRating, reviewCount });
  }

  async findByOwner(ownerId: string) {
    return findMany("Salon", {
      filters: { ownerId },
      order: { column: "createdAt", ascending: false },
    });
  }
}

export function createSalonRepository() {
  return new SalonRepository();
}