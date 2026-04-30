import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE() {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Verify user exists and is active
    const { data: dbUser, error } = await supabaseAdmin
      .from("User")
      .select("id, isActive")
      .eq("id", authUser.id)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!dbUser.isActive) {
      return NextResponse.json(
        { error: "Ce compte est déjà désactivé" },
        { status: 400 }
      );
    }

    // Soft delete: set isActive to false
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({
        isActive: false,
        email: `deleted_${authUser.id}_${Date.now()}@deleted.planity.ma`,
        phone: null,
        name: "Compte supprimé",
        passwordHash: null,
      })
      .eq("id", dbUser.id);

    if (updateError) {
      console.error("[DELETE /api/v1/user/account] Supabase error:", updateError);
      return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/v1/user/account]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}