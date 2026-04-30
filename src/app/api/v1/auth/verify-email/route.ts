import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    // Find user with valid token
    const { data: user, error: findError } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("verificationToken", token)
      .gte("verificationTokenExpires", new Date().toISOString())
      .maybeSingle();

    if (findError || !user) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // Mark email as verified
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({
        emailVerified: new Date().toISOString(),
        verificationToken: null,
        verificationTokenExpires: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Verify email update error:", updateError);
      return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}