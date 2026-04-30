import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/lib/db";
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

    // Check existing user in our DB
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 },
      );
    }

    // Sign up with Supabase Auth (sets cookies on response)
    const response = NextResponse.json({}, { status: 201 });

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

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
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

    // Also create user in our Prisma DB (source of truth for relational data)
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await db.user.create({
      data: {
        id: authData.user?.id, // Use Supabase Auth UUID
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        role: "CONSUMER",
        locale: "FR",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true,
      },
    });

    // Override the empty response with the real data
    return NextResponse.json(
      { success: true, user },
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