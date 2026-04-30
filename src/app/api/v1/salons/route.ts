import { NextResponse } from "next/server";
import { MOCK_SALONS, isSalonCurrentlyOpen } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

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
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Try DB first, fallback to mock
    try {
      const { db } = await import("@/lib/db");
      const where: Record<string, unknown> = {
        isActive: true,
      };

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

      if (minRating > 0) {
        where.averageRating = { gte: minRating };
      }

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

      if (isOpen) {
        const now = new Date();
        const jsDay = now.getDay();
        const schemaDay = (jsDay + 6) % 7;
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
          orderBy.createdAt = "desc";
      }

      const salons = await db.salon.findMany({
        where,
        orderBy,
        take: limit,
        include: {
          services: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
          staff: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
          openingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
          photos: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
      });

      if (salons.length > 0) {
        return NextResponse.json({ salons });
      }
    } catch {
      // DB not available, fall through
    }

    // Fallback: mock data with filters
    let filteredSalons = [...MOCK_SALONS];

    if (city) {
      filteredSalons = filteredSalons.filter(
        (s) => s.city.toLowerCase() === city.toLowerCase()
      );
    }
    if (category) {
      const cats = category
        .split(",")
        .map((c) => c.toUpperCase().replace(/-/g, "_").trim())
        .filter(Boolean);
      filteredSalons = filteredSalons.filter((s) => cats.includes(s.category));
    }
    if (minRating > 0) {
      filteredSalons = filteredSalons.filter(
        (s) => s.averageRating >= minRating
      );
    }
    if (isVerified) {
      filteredSalons = filteredSalons.filter((s) => s.isVerified);
    }
    if (minPrice > 0 || maxPrice > 0) {
      filteredSalons = filteredSalons.filter((s) => {
        const activeServices = s.services.filter((svc) => svc.isActive);
        return activeServices.some((svc) => {
          if (minPrice > 0 && maxPrice > 0) {
            return svc.price >= minPrice && svc.price <= maxPrice;
          } else if (minPrice > 0) {
            return svc.price >= minPrice;
          } else if (maxPrice > 0) {
            return svc.price <= maxPrice;
          }
          return true;
        });
      });
    }
    if (isOpen) {
      filteredSalons = filteredSalons.filter((s) =>
        isSalonCurrentlyOpen(s.openingHours)
      );
    }

    return NextResponse.json({
      salons: filteredSalons.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        description: s.description,
        city: s.city,
        address: s.address,
        phone: s.phone,
        email: s.email,
        coverImage: s.coverImage,
        photos: s.photos,
        isActive: s.isActive,
        isVerified: s.isVerified,
        averageRating: s.averageRating,
        reviewCount: s.reviewCount,
        services: s.services,
        staff: s.staff,
        openingHours: s.openingHours,
        _count: {
          reviews: s.reviewCount,
          bookings: Math.floor(s.reviewCount * 1.5),
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des salons" },
      { status: 500 }
    );
  }
}