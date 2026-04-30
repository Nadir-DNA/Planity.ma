import { NextResponse } from "next/server";
import { MOCK_SALONS, searchMockSalons } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const sortBy =
      searchParams.get("sort") || searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const isVerified = searchParams.get("isVerified") === "true";
    const isOpen = searchParams.get("isOpen") === "true";

    // Try Supabase first, fallback to mock data
    try {
      const { db } = await import("@/lib/db");
      const where: Record<string, unknown> = {
        isActive: true,
      };

      // Only filter isVerified when explicitly requested
      if (isVerified) {
        where.isVerified = true;
      }

      if (city) {
        where.city = { contains: city, mode: "insensitive" };
      }

      // Support multiple categories (comma-separated)
      if (category) {
        const categories = category
          .split(",")
          .map((c) => c.toUpperCase().replace(/-/g, "_").trim())
          .filter(Boolean);
        if (categories.length === 1) {
          where.category = categories[0];
        } else if (categories.length > 1) {
          where.category = { in: categories };
        }
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

      // Price range filter: salon must have at least one service within range
      if (minPrice > 0 || maxPrice > 0) {
        const serviceFilter: Record<string, unknown> = { isActive: true };
        if (minPrice > 0 && maxPrice > 0) {
          serviceFilter.price = { gte: minPrice, lte: maxPrice };
        } else if (minPrice > 0) {
          serviceFilter.price = { gte: minPrice };
        } else if (maxPrice > 0) {
          serviceFilter.price = { lte: maxPrice };
        }
        where.services = { some: serviceFilter };
      }

      // Open now filter
      if (isOpen) {
        const now = new Date();
        const jsDay = now.getDay(); // 0=Sunday
        const schemaDay = (jsDay + 6) % 7; // Convert to 0=Monday for schema
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        where.openingHours = {
          some: {
            dayOfWeek: schemaDay,
            isClosed: false,
            openTime: { lte: currentTime },
            closeTime: { gte: currentTime },
          },
        };
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
            openingHours: {
              orderBy: { dayOfWeek: "asc" },
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
      minPrice,
      maxPrice,
      isVerified,
      isOpen,
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