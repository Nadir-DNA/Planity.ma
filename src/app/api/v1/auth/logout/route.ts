import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Get the access token from cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return [name, rest.join("=")];
      })
    );

    const accessToken = cookies["sb-access-token"];

    if (!accessToken) {
      return NextResponse.json({ success: true });
    }

    // Sign out from Supabase (invalidates the session)
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) {
      console.error("Supabase signOut error:", error.message);
      // Still clear cookies locally even if server-side signout fails
    }

    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.set("sb-access-token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    });
    response.cookies.set("sb-refresh-token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
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