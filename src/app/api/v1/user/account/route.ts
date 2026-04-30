import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Verify user exists and is active
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Ce compte est déjà désactivé" },
        { status: 400 }
      );
    }

    // Soft delete: set isActive to false
    await db.user.update({
      where: { id: session.user.id },
      data: {
        isActive: false,
        email: `deleted_${session.user.id}_${Date.now()}@deleted.planity.ma`,
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