import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    // Verify credentials against our Prisma DB (source of truth)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    // Create a response first so we can set cookies on it
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        locale: user.locale,
      },
    });

    // Sign in with Supabase Auth via SSR client (sets auth cookies on response)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Read cookies from the incoming request
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
            // Set cookies on the outgoing response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      console.error("Supabase signInWithPassword error:", signInError.message);
      return NextResponse.json(
        { error: "Erreur de connexion" },
        { status: 500 },
      );
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Login error details:", message, stack);
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: message },
      { status: 500 },
    );
  }
}