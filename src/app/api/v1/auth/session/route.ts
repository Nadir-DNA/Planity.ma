import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";

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

export async function GET(request: Request) {
  try {
    // Use Supabase SSR to properly read the session from cookies
    const supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookiesFromRequest(request);
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // This reads and validates the session from properly formatted cookies
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    // Get extended user profile from our DB
    const { data: profile } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, locale")
      .eq("id", user.id)
      .single();

    // Merge Supabase auth response cookies (refreshed tokens) into our response
    const jsonResponse = NextResponse.json({
      user: {
        id: profile?.id || user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || "",
        role: profile?.role || "CONSUMER",
        locale: profile?.locale || "FR",
      },
    });

    // Copy any refreshed cookies from supabaseResponse to our JSON response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value);
    });

    return jsonResponse;
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}