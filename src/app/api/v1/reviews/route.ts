import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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
    const body = await request.json();
    const {
      bookingId,
      userId,
      salonId,
      overallRating,
      qualityRating,
      timingRating,
      receptionRating,
      hygieneRating,
      comment,
    } = body;

    if (!bookingId || !userId || !salonId || !overallRating) {
      return NextResponse.json(
        { error: "Donnees manquantes" },
        { status: 400 }
      );
    }

    // Check booking exists and belongs to user
    const booking = await db.booking.findFirst({
      where: { id: bookingId, userId, salonId, status: "COMPLETED" },
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
        userId,
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
