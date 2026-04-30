import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMockSalon } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Try Supabase first
    const { data: salonData, error: salonError } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("slug", slug)
      .eq("isActive", true)
      .single();

    if (salonData && !salonError) {
      const { data: staff, error: staffError } = await supabaseAdmin
        .from("StaffMember")
        .select("id, displayName, title, color, avatar, bio, isActive")
        .eq("salonId", salonData.id)
        .eq("isActive", true)
        .order("order", { ascending: true });

      if (staffError) {
        console.error("Staff fetch error:", staffError);
        return NextResponse.json(
          { error: "Erreur lors du chargement de l\'équipe" },
          { status: 500 }
        );
      }

      return NextResponse.json({ staff });
    }

    // Fallback to mock data
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
      { error: "Erreur lors du chargement de l\'équipe" },
      { status: 500 }
    );
  }
}
