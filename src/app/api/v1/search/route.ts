import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

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

    return NextResponse.json({
      salons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
