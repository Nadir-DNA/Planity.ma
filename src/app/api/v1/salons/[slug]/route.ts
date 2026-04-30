import { NextResponse } from "next/server";
import { getMockSalon } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Try DB first, fallback to mock
    try {
      const { db } = await import("@/lib/db");
      const salon = await db.salon.findUnique({
        where: { slug },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              category: true,
              assignedStaff: {
                include: { staff: true },
              },
            },
          },
          staff: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
          openingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
          reviews: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: { name: true, avatar: true },
              },
            },
          },
          photos: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
      });

      if (salon) {
        return NextResponse.json({ salon });
      }
    } catch {
      // DB not available, fall through
    }

    // Fallback: mock data
    const mockSalon = getMockSalon(slug);

    if (!mockSalon) {
      return NextResponse.json(
        { error: "Salon introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      salon: {
        ...mockSalon,
        _count: {
          reviews: mockSalon.reviewCount,
          bookings: Math.floor(mockSalon.reviewCount * 1.5),
        },
      },
    });
  } catch (error) {
    console.error("Salon fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du salon" },
      { status: 500 }
    );
  }
}