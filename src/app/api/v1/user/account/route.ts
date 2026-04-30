import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Verify user exists and is active
    const dbUser = await db.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, isActive: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!dbUser.isActive) {
      return NextResponse.json(
        { error: "Ce compte est déjà désactivé" },
        { status: 400 }
      );
    }

    // Soft delete: set isActive to false
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        isActive: false,
        email: `deleted_${dbUser.id}_${Date.now()}@deleted.planity.ma`,
        phone: null,
        name: "Compte supprimé",
        passwordHash: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/v1/user/account]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}