import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check existing user via Supabase REST API
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from("User")
      .select("id, email")
      .eq("email", data.email);

    if (checkError) {
      console.error("Check user error:", checkError.message);
      return NextResponse.json(
        { error: "Erreur lors de la vérification" },
        { status: 500 },
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 },
      );
    }

    // Sign up with Supabase Auth (creates auth user)
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: "CONSUMER",
          locale: "FR",
        },
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 },
      );
    }

    // Also create user record in Supabase DB via REST
    const passwordHash = await bcrypt.hash(data.password, 12);
    const userId = authData.user?.id || crypto.randomUUID();

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("User")
      .insert({
        id: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        role: "CONSUMER",
        locale: "FR",
        isActive: true,
      })
      .select("id, email, name, role, locale")
      .single();

    if (insertError) {
      console.error("Insert user error:", insertError.message);
      return NextResponse.json(
        { error: "Erreur lors de la création du compte" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 },
    );
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