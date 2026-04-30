import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
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

    // Step 1: Verify credentials against our Supabase DB (REST API, works from Vercel)
    const { data: users, error: dbError } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, locale, passwordHash")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    if (dbError || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const user = users[0];

    if (!user.passwordHash) {
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

    // Step 2: Sign in with Supabase Auth to create a session
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      console.error("Supabase signInWithPassword error:", signInError.message);
      // Auth sign-in failed, return error
      return NextResponse.json(
        { error: "Erreur de connexion" },
        { status: 500 },
      );
    }

    // Step 3: Create response with user data and set auth cookies
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        locale: user.locale,
      },
    });

    // Set Supabase auth cookies on the response
    if (authData.session) {
      response.cookies.set("sb-access-token", authData.session.access_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: authData.session.expires_in,
      });
      response.cookies.set("sb-refresh-token", authData.session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Login error:", message);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}