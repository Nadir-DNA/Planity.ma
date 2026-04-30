
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    // Find user with valid token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user and clear token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return NextResponse.json({ success: true, message: "Mot de passe réinitialisé" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
