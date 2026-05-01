import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Get all possible auth cookie names (both old and new naming)
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return [name, rest.join("=")];
      })
    );

    // Determine project ref for cookie naming
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    const accessTokenName = `${projectRef}-auth-token`;

    // Try new cookie name first, fall back to old
    const accessToken =
      cookies[accessTokenName] ||
      cookies[`${accessTokenName}.code`] ||
      cookies["sb-access-token"];

    if (accessToken) {
      // Sign out from Supabase (invalidates the session)
      const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
      if (error) {
        console.error("Supabase signOut error:", error.message);
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear ALL possible auth cookies (both naming conventions)
    const allCookieNames = [
      accessTokenName,
      `${accessTokenName}.code`,
      "sb-access-token",
      "sb-refresh-token",
    ];

    allCookieNames.forEach((name) => {
      response.cookies.set(name, "", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 0,
      });
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}