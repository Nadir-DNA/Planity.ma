
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
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

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return NextResponse.json({ success: true, message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
