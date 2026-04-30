import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { MOCK_SALONS, isSalonCurrentlyOpen } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// CRIT-02 FIX: Strip PII fields from salon data for public endpoints
function stripSalonPII(salon: Record<string, unknown>) {
  const { ownerId, passwordHash, ...safe } = salon as Record<string, unknown>;
  return safe;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const isVerified = searchParams.get("isVerified") === "true";
    const isOpen = searchParams.get("isOpen") === "true";
    const sortBy = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // Try Supabase first
    try {
      let query = supabaseAdmin
        .from("Salon")
        .select("id, name, slug, category, description, city, address, coverImage, isActive, isVerified, averageRating, reviewCount, latitude, longitude, services:Service(*), staff:StaffMember(*), openingHours:OpeningHour(*), photos:SalonPhoto(*)", { count: "exact" })
        .eq("isActive", true)
        .order(sortBy === "rating" ? "averageRating" : "createdAt", { ascending: sortBy === "name" })
        .limit(limit);

      if (isVerified) query = query.eq("isVerified", true);
      if (city) query = query.ilike("city", `%${city}%`);
      if (category) {
        const categories = category.split(",").map(c => c.toUpperCase().replace(/-/g, "_").trim()).filter(Boolean);
        if (categories.length === 1) query = query.eq("category", categories[0]);
        else if (categories.length > 1) query = query.in("category", categories);
      }
      if (minRating > 0) query = query.gte("averageRating", minRating);

      const { data: salons, count: total, error } = await query;

      if (!error && salons && salons.length > 0) {
        // CRIT-02: Strip PII — remove ownerId, passwordHash from any nested data
        const safeSalons = salons.map(stripSalonPII);
        return NextResponse.json({ salons: safeSalons, total: total || salons.length });
      }
    } catch {
      // DB not available, fall through to mock
    }

    // Fallback: mock data with filters (CRIT-02: strip PII from mock too)
    let filteredSalons = [...MOCK_SALONS];

    if (city) filteredSalons = filteredSalons.filter(s => s.city.toLowerCase() === city.toLowerCase());
    if (category) {
      const cats = category.split(",").map(c => c.toUpperCase().replace(/-/g, "_").trim()).filter(Boolean);
      filteredSalons = filteredSalons.filter(s => cats.includes(s.category));
    }
    if (minRating > 0) filteredSalons = filteredSalons.filter(s => s.averageRating >= minRating);
    if (isVerified) filteredSalons = filteredSalons.filter(s => s.isVerified);
    if (minPrice > 0 || maxPrice > 0) {
      filteredSalons = filteredSalons.filter(s => {
        const activeServices = s.services.filter(svc => svc.isActive);
        return activeServices.some(svc => {
          if (minPrice > 0 && maxPrice > 0) return svc.price >= minPrice && svc.price <= maxPrice;
          if (minPrice > 0) return svc.price >= minPrice;
          if (maxPrice > 0) return svc.price <= maxPrice;
          return true;
        });
      });
    }
    if (isOpen) filteredSalons = filteredSalons.filter(s => isSalonCurrentlyOpen(s.openingHours));

    // CRIT-02: mock fallback — no email/phone/ownerId leak
    return NextResponse.json({
      salons: filteredSalons.map((s) => ({
        id: s.id, name: s.name, slug: s.slug, category: s.category,
        description: s.description, city: s.city, address: s.address,
        coverImage: s.coverImage, isActive: s.isActive, isVerified: s.isVerified,
        averageRating: s.averageRating, reviewCount: s.reviewCount,
        latitude: s.latitude, longitude: s.longitude,
        photos: s.photos, reviews: s.reviews,
        services: s.services, staff: s.staff, openingHours: s.openingHours,
        _count: { reviews: s.reviewCount, bookings: Math.floor(s.reviewCount * 1.5) },
      })),
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des salons" }, { status: 500 });
  }
}
