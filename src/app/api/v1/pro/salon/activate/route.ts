import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { initSalonSubscription } from "@/server/services/dodo-payment.service";

export const dynamic = "force-dynamic";

// POST /api/v1/pro/salon/activate — (re)lancer le checkout d'abonnement Dodo
export async function POST(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: salon } = await supabaseAdmin
      .from("Salon")
      .select("id, isActive")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }
    if (salon.isActive) {
      return NextResponse.json({ error: "Votre salon est déjà actif" }, { status: 400 });
    }

    const result = await initSalonSubscription(salon.id);
    if (!result.success || !result.redirectUrl) {
      return NextResponse.json(
        { error: result.error || "Impossible de créer le paiement" },
        { status: 502 }
      );
    }

    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (error) {
    console.error("POST /api/v1/pro/salon/activate error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
