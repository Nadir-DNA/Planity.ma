import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Helper to get auth cookies with both naming conventions
function getAuthCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [n, ...rest] = c.trim().split("=");
      return [n, rest.join("=")];
    })
  );
  return cookies[name];
}

export async function GET(request: Request) {
  try {
    // Determine project ref for cookie naming
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    const accessTokenName = `${projectRef}-auth-token`;

    // Try new Supabase SSR cookie name first, fall back to old
    let accessToken =
      getAuthCookie(request, accessTokenName) ||
      getAuthCookie(request, "sb-access-token");

    let refreshToken =
      getAuthCookie(request, `${accessTokenName}.code`) ||
      getAuthCookie(request, "sb-refresh-token");

    if (!accessToken) {
      return NextResponse.json({ user: null });
    }

    // Verify the access token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data.user) {
      // Try refreshing the token
      if (refreshToken) {
        const { data: refreshData, error: refreshError } =
          await supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken,
          });

        if (refreshError || !refreshData.user) {
          return NextResponse.json({ user: null });
        }

        // Get user profile from Supabase DB via REST
        const { data: profile } = await supabaseAdmin
          .from("User")
          .select("id, email, name, role, locale")
          .eq("email", refreshData.user.email)
          .single();

        const response = NextResponse.json({
          user: {
            id: profile?.id || refreshData.user.id,
            email: refreshData.user.email,
            name: profile?.name || refreshData.user.user_metadata?.name || "",
            role: profile?.role || "CONSUMER",
            locale: profile?.locale || "FR",
          },
        });

        // Update cookies with new tokens (using both naming conventions for compatibility)
        if (refreshData.session) {
          // New SSR-style cookies
          response.cookies.set(accessTokenName, refreshData.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: refreshData.session.expires_in,
          });
          response.cookies.set(`${accessTokenName}.code`, refreshData.session.refresh_token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365,
          });
          // Old-style cookies for backwards compatibility
          response.cookies.set("sb-access-token", refreshData.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: refreshData.session.expires_in,
          });
          response.cookies.set("sb-refresh-token", refreshData.session.refresh_token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365,
          });
        }

        return response;
      }

      return NextResponse.json({ user: null });
    }

    // Token valid — get user profile from Supabase DB via REST
    const { data: profile } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, locale")
      .eq("email", data.user.email)
      .single();

    return NextResponse.json({
      user: {
        id: profile?.id || data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || "",
        role: profile?.role || "CONSUMER",
        locale: profile?.locale || "FR",
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}