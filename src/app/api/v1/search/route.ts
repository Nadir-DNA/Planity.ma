import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { MOCK_SALONS, searchMockSalons } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// CRIT-02 FIX: Strip PII fields from salon data
function stripSalonPII(salon: Record<string, unknown>) {
  const { ownerId, passwordHash, email, phone, ...safe } = salon as Record<string, unknown>;
  return safe;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const isVerified = searchParams.get("isVerified") === "true";
    const isOpen = searchParams.get("isOpen") === "true";

    // Try Supabase first
    try {
      let queryBuilder = supabaseAdmin
        .from("Salon")
        .select("id, name, slug, category, description, city, address, coverImage, isActive, isVerified, averageRating, reviewCount, latitude, longitude, services:Service(id, name, slug, price, duration, isActive), openingHours:OpeningHour(*), photos:SalonPhoto(*)", { count: "exact" })
        .eq("isActive", true);

      if (isVerified) queryBuilder = queryBuilder.eq("isVerified", true);
      if (city) queryBuilder = queryBuilder.ilike("city", `%${city}%`);
      if (category) {
        const categories = category.split(",").map(c => c.toUpperCase().replace(/-/g, "_").trim()).filter(Boolean);
        if (categories.length === 1) queryBuilder = queryBuilder.eq("category", categories[0]);
        else if (categories.length > 1) queryBuilder = queryBuilder.in("category", categories);
      }
      if (query) queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
      if (minRating > 0) queryBuilder = queryBuilder.gte("averageRating", minRating);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      if (sortBy === "rating") queryBuilder = queryBuilder.order("averageRating", { ascending: false });
      else if (sortBy === "name") queryBuilder = queryBuilder.order("name", { ascending: true });
      else queryBuilder = queryBuilder.order("reviewCount", { ascending: false });

      const { data: salons, count: total, error } = await queryBuilder;

      if (!error && salons && (salons.length > 0 || (total && total > 0))) {
        const safeSalons = salons.map(stripSalonPII);
        return NextResponse.json({
          salons: safeSalons,
          total: total || salons.length,
          page,
          totalPages: Math.ceil((total || salons.length) / limit),
        });
      }
    } catch {
      // DB not available, fall through to mock
    }

    // Fallback: mock data (CRIT-02: strip PII)
    const result = searchMockSalons({ query, city, category, minRating, minPrice, maxPrice, isVerified, isOpen, sortBy, page, limit });
    const safeSalons = ((result.salons || result) as unknown as Record<string, unknown>[]).map(stripSalonPII);
    return NextResponse.json({ salons: safeSalons, total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 });
  }
}
