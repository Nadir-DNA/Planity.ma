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

    // Step 1: Verify credentials against our Supabase DB
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

    if (signInError || !authData.session) {
      console.error("Supabase signInWithPassword error:", signInError?.message);
      return NextResponse.json(
        { error: "Erreur de connexion" },
        { status: 500 },
      );
    }

    // Step 3: Use createServerClient to set auth cookies in the CORRECT format
    // Supabase SSR encodes sessions as base64url + chunks. Manual cookie setting
    // with raw JWTs doesn't work because the middleware's createServerClient
    // expects the base64-<encoded_session> format.
    const supabaseResponse = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        locale: user.locale,
      },
    });

    // Parse cookies from the request manually (Request doesn't have .cookies.getAll)
    const requestCookies: { name: string; value: string }[] = [];
    const cookieHeader = request.headers.get("cookie") || "";
    for (const part of cookieHeader.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        requestCookies.push({
          name: trimmed.substring(0, eqIndex),
          value: trimmed.substring(eqIndex + 1),
        });
      }
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return requestCookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Set the session — this calls setAll internally to write correctly formatted cookies
    await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });

    return supabaseResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Login error:", message);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}