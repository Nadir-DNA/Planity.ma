import { NextResponse } from "next/server";

export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    debug.env = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };
  } catch (e) {
    debug.envError = String(e);
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    debug.supabaseSSR = { data: !!data, error: error?.message };
  } catch (e) {
    debug.supabaseSSRError = String(e);
  }

  try {
    const { db } = await import("@/lib/db");
    const user = await db.user.findFirst({ select: { id: true, email: true } });
    debug.prisma = { user };
  } catch (e) {
    debug.prismaError = String(e);
  }

  return NextResponse.json(debug);
}