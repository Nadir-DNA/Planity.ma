import { NextResponse } from "next/server";
import { MOCK_SALONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try DB first, fallback to mock
    try {
      const { db } = await import("@/lib/db");
      const salons = await db.salon.findMany({
        where: { isActive: true, isVerified: true },
        orderBy: { createdAt: "desc" },
        take: 50,
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

    // Fallback: mock data
    return NextResponse.json({
      salons: MOCK_SALONS.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        description: s.description,
        city: s.city,
        address: s.address,
        phone: s.phone,
        email: s.email,
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