
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal whether user exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        verificationTokenExpires: expiresAt,
      },
    });

    // Send email with Resend
    const resetUrl = `${process.env.NEXTAUTH_URL || "https://planity.ma"}/reinitialiser-mot-de-passe?token=${resetToken}`;
    const html = getPasswordResetEmailHtml(resetUrl, user.name || "");
    
    await sendEmail({
      to: user.email!,
      subject: "Réinitialisation de votre mot de passe - Planity.ma",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
