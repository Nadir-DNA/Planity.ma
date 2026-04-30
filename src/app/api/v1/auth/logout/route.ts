import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get("cookie") || "";
            return cookieHeader
              .split(";")
              .filter(Boolean)
              .map((c) => {
                const [name, ...rest] = c.trim().split("=");
                return { name, value: rest.join("=") };
              });
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la déconnexion" },
        { status: 500 },
      );
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}