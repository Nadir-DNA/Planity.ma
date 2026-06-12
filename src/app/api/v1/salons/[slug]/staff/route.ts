import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
      // Erreur Supabase inattendue → 404 ci-dessous
    }

    return NextResponse.json(
      { error: "Salon non trouvé" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de l'équipe" },
      { status: 500 }
    );
  }
}