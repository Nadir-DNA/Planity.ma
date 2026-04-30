import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { paginationSchema, apiValidation } from "@/lib/validations";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Extended review schema for POST
const createReviewSchemaExtended = z.object({
  bookingId: z.string().min(1, "bookingId requis"),
  salonId: z.string().min(1, "salonId requis"),
  overallRating: z.coerce.number().int().min(1).max(5),
  qualityRating: z.coerce.number().int().min(1).max(5).optional(),
  timingRating: z.coerce.number().int().min(1).max(5).optional(),
  receptionRating: z.coerce.number().int().min(1).max(5).optional(),
  hygieneRating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().min(10, "Commentaire trop court").max(1000).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    
    // Validate pagination with Zod
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit") || "10",
    });

    if (!salonId) {
      return NextResponse.json(
        { error: "salonId est requis" },
        { status: 400 }
      );
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { salonId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      }),
      db.review.count({ where: { salonId, status: "APPROVED" } }),
    ]);

    // Compute average ratings
    const stats = await db.review.aggregate({
      where: { salonId, status: "APPROVED" },
      _avg: {
        overallRating: true,
        qualityRating: true,
        timingRating: true,
        receptionRating: true,
        hygieneRating: true,
      },
      _count: true,
    });

    return NextResponse.json({
      reviews,
      stats: {
        average: stats._avg.overallRating,
        quality: stats._avg.qualityRating,
        timing: stats._avg.timingRating,
        reception: stats._avg.receptionRating,
        hygiene: stats._avg.hygieneRating,
        count: stats._count,
      },
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des avis" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Non autorise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate with Zod
    const validation = apiValidation(createReviewSchemaExtended, body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    const { bookingId, salonId, overallRating, qualityRating, timingRating, receptionRating, hygieneRating, comment } = validation.data;

    // Check booking exists and belongs to user
    const booking = await db.booking.findFirst({
      where: { id: bookingId, userId: user.id, salonId, status: "COMPLETED" },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reservation non trouvee ou non terminee" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Un avis existe deja pour cette reservation" },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        bookingId,
        userId: user.id,
        salonId,
        overallRating,
        qualityRating,
        timingRating,
        receptionRating,
        hygieneRating,
        comment,
        status: "PENDING",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation de l'avis" },
      { status: 500 }
    );
  }
}
