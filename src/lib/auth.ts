import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  locale: string;
}

/**
 * Get the current authenticated user from the Supabase session,
 * then fetch the full profile from the User table via supabaseAdmin REST.
 * Returns null if no session exists.
 * Use this in Server Components, Server Actions, and API routes.
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  // Fetch user profile from Supabase DB via REST
  const { data: profile } = await supabaseAdmin
    .from("User")
    .select("id, email, name, role, locale")
    .eq("id", supabaseUser.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      email: profile.email ?? supabaseUser.email ?? "",
      role: (profile.role as UserRole) ?? "CONSUMER",
      name: profile.name ?? null,
      locale: profile.locale ?? "FR",
    };
  }

  // Fallback to metadata if profile row doesn't exist yet
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    role: (supabaseUser.user_metadata?.role as UserRole) ?? "CONSUMER",
    name:
      supabaseUser.user_metadata?.name ??
      supabaseUser.user_metadata?.full_name ??
      null,
    locale: (supabaseUser.user_metadata?.locale as string) ?? "FR",
  };
}

// Re-export createClient for callers that need direct Supabase access
export { createClient };