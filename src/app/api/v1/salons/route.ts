import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

    let query = supabaseAdmin
      .from("Salon")
      .select("id, name, slug, category, description, city, address, coverImage, isActive, isVerified, averageRating, reviewCount, latitude, longitude, services:Service(*), staff:StaffMember(*), openingHours:SalonSchedule(id, dayOfWeek, openTime, closeTime, isClosed),photos:SalonPhoto(*)", { count: "exact" })
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

    if (error) {
      console.error("Salons fetch error:", error.message);
      return NextResponse.json({ error: "Erreur lors du chargement des salons" }, { status: 500 });
    }

    // CRIT-02: Strip PII — remove ownerId, passwordHash from any nested data
    const safeSalons = (salons || []).map(stripSalonPII);
    return NextResponse.json({ salons: safeSalons, total: total || safeSalons.length });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des salons" }, { status: 500 });
  }
}
