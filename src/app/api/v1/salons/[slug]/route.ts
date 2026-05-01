import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMockSalon } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try Supabase first — search by slug OR id
    try {
      // Try by slug first
      const { data: salonBySlug, error: slugError } = await supabaseAdmin
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

      if (salonBySlug && !slugError) {
        const { email, phone, ownerId, ...safeSalon } = salonBySlug;
        return NextResponse.json({ salon: safeSalon });
      }

      // Fallback: try by id
      const { data: salonById, error: idError } = await supabaseAdmin
        .from("Salon")
        .select(`
          *,
          services:Service(id, name, description, price, duration, isActive, isOnlineBookable, order),
          staff:StaffMember(id, displayName, title, color, avatar, bio, isActive, order),
          openingHours:SalonSchedule(id, dayOfWeek, openTime, closeTime, isClosed),
          reviews:Review(id, author, overallRating, comment, date, status),
          photos:SalonPhoto(id, url, alt, order)
        `)
        .eq("id", slug)
        .eq("isActive", true)
        .single();

      if (salonById && !idError) {
        const { email, phone, ownerId, ...safeSalon } = salonById;
        return NextResponse.json({ salon: safeSalon });
      }
    } catch {
      // Supabase not available, fall through to mock
    }

    // Fallback: mock data (searches by slug OR id)
    const mockSalon = getMockSalon(slug);

    if (!mockSalon) {
      return NextResponse.json(
        { error: "Salon introuvable" },
        { status: 404 }
      );
    }

    // Strip PII from mock response
    const { email: _email, phone: _phone, ...safeMockSalon } = mockSalon;
    return NextResponse.json({
      salon: {
        ...safeMockSalon,
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