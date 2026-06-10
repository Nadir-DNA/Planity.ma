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
export async function getUser(request?: Request): Promise<AuthUser | null> {
  try {
    let supabaseUser = null;

    // Strategy 1: Try Bearer token from Authorization header
    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const { data, error } = await supabaseAdmin.auth.getUser(token);
          if (!error && data.user) {
            supabaseUser = data.user;
          }
        } catch {
          // Token validation failed, try cookie strategy
        }
      }
    }

    // Strategy 2: Try Supabase SSR cookies (browser flow)
    if (!supabaseUser) {
      try {
        const supabase = await createClient();
        const {
          data: { user: cookieUser },
        } = await supabase.auth.getUser();
        if (cookieUser) {
          supabaseUser = cookieUser;
        }
      } catch {
        // createClient() may throw if called outside a request context
      }
    }

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