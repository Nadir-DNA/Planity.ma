import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

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

// ── Validation ───────────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(2, "Prénom requis (min 2 caractères)"),
  lastName: z.string().min(2, "Nom requis (min 2 caractères)"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Mot de passe trop court (min 8 caractères)"),
});

// ── Route POST /api/v1/auth/register ─────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const normalizedEmail = data.email.toLowerCase().trim();

    // ── 1. Vérifier si l'email existe déjà ────────────────
    const { data: existing, error: checkDbError } = await supabaseAdmin
      .from("User")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (checkDbError) {
      console.error("Check user error:", checkDbError.message);
      return NextResponse.json({ error: "Erreur de vérification" }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 },
      );
    }

    // ── 2. Créer l'utilisateur dans Supabase Auth (auto-confirmé) ──
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: "CONSUMER",
        locale: "FR",
        phone: data.phone || null,
      },
    });

    if (signUpError || !authData.user) {
      console.error("Admin createUser error:", signUpError?.message);
      return NextResponse.json(
        { error: signUpError?.message || "Erreur lors de la création du compte" },
        { status: 400 },
      );
    }

    const userId = authData.user.id;

    // ── 3. Insérer dans la table User ──────────────────────
    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date().toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("User")
      .insert({
        id: userId,
        email: normalizedEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone || null,
        passwordHash,
        role: "CONSUMER",
        locale: "FR",
        isActive: true,
        updatedAt: now,
      });

    if (insertError) {
      // Si l'insert échoue, on supprime l'utilisateur Auth pour éviter les orphelins
      console.error("Insert User error (rolling back auth user):", insertError.message);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Erreur technique : ${insertError.message}` },
        { status: 500 },
      );
    }

    // ── 4. Auto-connexion (créer une session) ──────────────
    const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password: data.password,
    });

    if (signInError || !sessionData.session) {
      // L'utilisateur est créé mais la session a échoué → rediriger vers login
      console.error("Auto-login after registration failed:", signInError?.message);
      return NextResponse.json(
        { success: true, user: { id: userId, email: normalizedEmail }, redirectTo: "/connexion" },
        { status: 201 },
      );
    }

    // ── 5. Définir les cookies de session ──────────────────
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: normalizedEmail,
        name: `${data.firstName} ${data.lastName}`,
        role: "CONSUMER",
        locale: "FR",
      },
    });

    await setAuthCookies(
      request,
      response,
      sessionData.session.access_token,
      sessionData.session.refresh_token,
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[POST /api/v1/auth/register]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 },
    );
  }
}
