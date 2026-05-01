import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMockSalon } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try Supabase first — search by slug OR id
    try {
      // Try by slug
      const { data: salonBySlug, error: slugError } = await supabaseAdmin
        .from("Salon")
        .select("id")
        .eq("slug", slug)
        .eq("isActive", true)
        .single();

      let salonId = salonBySlug?.id;

      // If slug not found, try by id
      if (!salonId) {
        const { data: salonById, error: idError } = await supabaseAdmin
          .from("Salon")
          .select("id")
          .eq("id", slug)
          .eq("isActive", true)
          .single();

        if (salonById && !idError) {
          salonId = salonById.id;
        }
      }

      if (salonId) {
        const { data: staff, error: staffError } = await supabaseAdmin
          .from("StaffMember")
          .select("id, displayName, title, color, avatar, bio, isActive")
          .eq("salonId", salonId)
          .eq("isActive", true)
          .order("order", { ascending: true });

        if (staffError) {
          console.error("Staff fetch error:", staffError);
          return NextResponse.json(
            { error: "Erreur lors du chargement de l'équipe" },
            { status: 500 }
          );
        }

        return NextResponse.json({ staff });
      }
    } catch {
      // Supabase not available, fall through to mock
    }

    // Fallback to mock data (searches by slug OR id)
    const mockSalon = getMockSalon(slug);
    if (!mockSalon) {
      return NextResponse.json(
        { error: "Salon non trouvé" },
        { status: 404 }
      );
    }

    const staff = mockSalon.staff
      .filter(s => s.isActive)
      .map(({ id, displayName, title, color, avatar }) => ({
        id, displayName, title, color, avatar,
      }));

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de l'équipe" },
      { status: 500 }
    );
  }
}