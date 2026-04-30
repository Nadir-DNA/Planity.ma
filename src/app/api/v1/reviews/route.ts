import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, count: total, error: reviewsError } = await supabaseAdmin
      .from("Review")
      .select("*, user:User(name, avatar)", { count: "exact" })
      .eq("salonId", salonId)
      .eq("status", "APPROVED")
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (reviewsError) {
      console.error("Reviews fetch Supabase error:", reviewsError);
      return NextResponse.json(
        { error: "Erreur lors du chargement des avis" },
        { status: 500 }
      );
    }

    // Compute average ratings
    const { data: allReviews, error: statsError } = await supabaseAdmin
      .from("Review")
      .select("overallRating, qualityRating, timingRating, receptionRating, hygieneRating")
      .eq("salonId", salonId)
      .eq("status", "APPROVED");

    if (statsError) {
      console.error("Reviews stats Supabase error:", statsError);
    }

    const count = allReviews?.length || 0;
    const avg = (field: string) => {
      const vals = allReviews?.map((r: Record<string, unknown>) => r[field]).filter((v): v is number => v !== null) || [];
      return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
    };

    return NextResponse.json({
      reviews: reviews || [],
      stats: {
        average: avg("overallRating"),
        quality: avg("qualityRating"),
        timing: avg("timingRating"),
        reception: avg("receptionRating"),
        hygiene: avg("hygieneRating"),
        count,
      },
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit),
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
    const user = await getUser(request);
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
    const { data: booking } = await supabaseAdmin
      .from("Booking")
      .select("id")
      .eq("id", bookingId)
      .eq("userId", user.id)
      .eq("salonId", salonId)
      .eq("status", "COMPLETED")
      .maybeSingle();

    if (!booking) {
      return NextResponse.json(
        { error: "Reservation non trouvee ou non terminee" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from("Review")
      .select("id")
      .eq("bookingId", bookingId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "Un avis existe deja pour cette reservation" },
        { status: 409 }
      );
    }

    const { data: review, error: createError } = await supabaseAdmin
      .from("Review")
      .insert({
        bookingId,
        userId: user.id,
        salonId,
        overallRating,
        qualityRating: qualityRating || null,
        timingRating: timingRating || null,
        receptionRating: receptionRating || null,
        hygieneRating: hygieneRating || null,
        comment: comment || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (createError) {
      console.error("Review creation Supabase error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la creation de l'avis" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation de l'avis" },
      { status: 500 }
    );
  }
}