import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://planity.ma";

    // Use Supabase native password reset (PKCE flow)
    // Supabase sends its own email — no custom email logic needed
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: `${appUrl}/reinitialiser-mot-de-passe` }
    );

    if (error) {
      console.error("Supabase reset password error:", error);
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
