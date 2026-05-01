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
 * Get the current authenticated user.
 *
 * Always uses Supabase SSR (createServerClient) which reads cookies
 * in the correct format (base64url-encoded, chunked, project-ref-prefixed).
 */
export async function getUser(_request?: Request): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) return null;

    // Fetch extended profile from our User table
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

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      role: (supabaseUser.user_metadata?.role as UserRole) ?? "CONSUMER",
      name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
      locale: (supabaseUser.user_metadata?.locale as string) ?? "FR",
    };
  } catch {
    // createClient() may throw if called outside a request context (e.g. in a worker)
    return null;
  }
}