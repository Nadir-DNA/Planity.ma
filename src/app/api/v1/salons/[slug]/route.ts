import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const salon = await db.salon.findUnique({
      where: { slug: params.slug },
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

    if (!salon) {
      return NextResponse.json(
        { error: "Salon introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ salon });
  } catch (error) {
    console.error("Salon fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du salon" },
      { status: 500 }
    );
  }
}
