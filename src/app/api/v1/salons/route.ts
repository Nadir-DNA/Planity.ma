import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
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

    return NextResponse.json({ salons });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des salons" },
      { status: 500 }
    );
  }
}
