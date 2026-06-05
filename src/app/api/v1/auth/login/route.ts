import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// ── Helpers cookies ──────────────────────────────────────
function parseCookiesFromRequest(request: Request): { name: string; value: string }[] {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies: { name: string; value: string }[] = [];
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      cookies.push({ name: trimmed.substring(0, eqIndex), value: trimmed.substring(eqIndex + 1) });
    }
  }
  return cookies;
}

function setAuthCookies(request: Request, response: NextResponse, accessToken: string, refreshToken: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return parseCookiesFromRequest(request); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  return supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
}

// ── Route POST /api/v1/auth/login ────────────────────────
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

    const normalizedEmail = email.toLowerCase().trim();

    // ── 1. Authentifier via Supabase Auth ──────────────────
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError || !authData.session) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    // ── 2. Récupérer / créer le profil dans la table User ──
    const authMeta = authData.user?.user_metadata || {};
    let userId = authData.user!.id;
    let userName: string | null = null;
    let userRole = "CONSUMER";
    let userLocale = "FR";

    const { data: existing } = await supabaseAdmin
      .from("User")
      .select("id, name, role, locale")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      userId = existing.id;
      userName = existing.name;
      userRole = existing.role;
      userLocale = existing.locale;
    } else {
      // Orphelin (Auth OK mais pas de ligne User) → création automatique
      const passwordHash = await bcrypt.hash(password, 12);
      const now = new Date().toISOString();
      const firstName = authMeta.firstName || null;
      const lastName = authMeta.lastName || null;
      const displayName = authMeta.name
        ?? (firstName
          ? `${firstName} ${lastName || ""}`.trim()
          : normalizedEmail.split("@")[0]);

      const { error: insertError } = await supabaseAdmin
        .from("User")
        .insert({
          id: userId,
          email: normalizedEmail,
          firstName,
          lastName,
          name: displayName,
          phone: authMeta.phone || null,
          passwordHash,
          role: authMeta.role || "CONSUMER",
          locale: authMeta.locale || "FR",
          isActive: true,
          updatedAt: now,
        });

      if (insertError) {
        console.error("Auto-create User record failed:", insertError.message);
      }

      userName = displayName;
      userRole = authMeta.role || "CONSUMER";
      userLocale = authMeta.locale || "FR";
    }

    // ── 3. Définir les cookies de session ──────────────────
    const response = NextResponse.json({
      user: {
        id: userId,
        email: normalizedEmail,
        name: userName,
        role: userRole,
        locale: userLocale,
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
    });

    await setAuthCookies(
      request,
      response,
      authData.session.access_token,
      authData.session.refresh_token,
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[POST /api/v1/auth/login]", message);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
