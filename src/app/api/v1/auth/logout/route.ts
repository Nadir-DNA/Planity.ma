import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function parseCookiesFromRequest(request: Request): { name: string; value: string }[] {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies: { name: string; value: string }[] = [];
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      cookies.push({
        name: trimmed.substring(0, eqIndex),
        value: trimmed.substring(eqIndex + 1),
      });
    }
  }
  return cookies;
}

export async function POST(request: Request) {
  try {
    const logoutResponse = NextResponse.json({ success: true });

    // Use Supabase SSR to properly clear auth cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookiesFromRequest(request);
          },
          setAll(cookiesToSet) {
            // signOut() will call setAll to clear all auth cookies
            cookiesToSet.forEach(({ name, value, options }) => {
              logoutResponse.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Sign out via Supabase SSR - clears all properly-formatted auth cookies
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signOut error:", error.message);
    }

    return logoutResponse;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}