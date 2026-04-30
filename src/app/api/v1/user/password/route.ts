import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const authUser = await getUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule" },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une minuscule" },
        { status: 400 }
      );
    }
    if (!/\d/.test(newPassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins un chiffre" },
        { status: 400 }
      );
    }

    // Fetch current user with passwordHash
    const { data: dbUser, error } = await supabaseAdmin
      .from("User")
      .select("id, passwordHash")
      .eq("id", authUser.id)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!dbUser.passwordHash) {
      return NextResponse.json(
        { error: "Ce compte n'utilise pas de mot de passe (connexion via Google)" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 401 }
      );
    }

    // Hash new password and update
    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({ passwordHash: newHash })
      .eq("id", dbUser.id);

    if (updateError) {
      console.error("[PATCH /api/v1/user/password] Supabase update error:", updateError);
      return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/v1/user/password]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}