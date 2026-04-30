import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return [name, rest.join("=")];
      })
    );

    const accessToken = cookies["sb-access-token"];
    const refreshToken = cookies["sb-refresh-token"];

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

        // Update cookies with new tokens
        if (refreshData.session) {
          response.cookies.set("sb-access-token", refreshData.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: refreshData.session.expires_in,
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