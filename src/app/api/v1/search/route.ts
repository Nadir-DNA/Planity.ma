import { NextResponse } from "next/server";
import { MOCK_SALONS, searchMockSalons } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    // Try Supabase first, fallback to mock data
    try {
      const { db } = await import("@/lib/db");
      const where: Record<string, unknown> = {
        isActive: true,
        isVerified: true,
      };

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

      if (minRating > 0) {
        where.averageRating = { gte: minRating };
      }

      const orderBy: Record<string, string> = {};
      switch (sortBy) {
        case "rating":
          orderBy.averageRating = "desc";
          break;
        case "name":
          orderBy.name = "asc";
          break;
        default:
          orderBy.reviewCount = "desc";
      }

      const [salons, total] = await Promise.all([
        db.salon.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            services: {
              where: { isActive: true },
              take: 5,
              orderBy: { order: "asc" },
            },
            _count: {
              select: { reviews: true, bookings: true },
            },
          },
        }),
        db.salon.count({ where }),
      ]);

      // If DB has data, return it
      if (salons.length > 0 || total > 0) {
        return NextResponse.json({
          salons,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      }
    } catch {
      // DB not available, fall through to mock data
    }

    // Fallback: mock data
    const result = searchMockSalons({
      query,
      city,
      category,
      minRating,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}