import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMockSalon } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Try Supabase first
    try {
      const { data: salon, error } = await supabaseAdmin
        .from("Salon")
        .select(`
          *,
          services:Service(id, name, description, price, duration, isActive, isOnlineBookable, order),
          staff:StaffMember(id, displayName, title, color, avatar, bio, isActive, order),
          openingHours:SalonSchedule(id, dayOfWeek, openTime, closeTime, isClosed),
          reviews:Review(id, author, overallRating, comment, date, status),
          photos:SalonPhoto(id, url, alt, order)
        `)
        .eq("slug", slug)
        .eq("isActive", true)
        .single();

      if (salon && !error) {
        // Strip PII from salon response
        const { email, phone, ownerId, ...safeSalon } = salon;
        return NextResponse.json({ salon: safeSalon });
      }
    } catch {
      // Supabase not available, fall through to mock
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
