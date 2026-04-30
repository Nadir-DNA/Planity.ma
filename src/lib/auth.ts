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
 * Get the current authenticated user from the Supabase session.
 * Returns null if no session exists.
 * Use this in Server Components, Server Actions, and API routes.
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

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

/**
 * Backward-compatible wrapper that returns a session-like object
 * matching the old NextAuth shape: { user: AuthUser } | null.
 * Existing callers using `const session = await auth()` and `session?.user?.id`
 * can keep working without changes.
 */
export async function auth(): Promise<{ user: AuthUser } | null> {
  const user = await getUser();
  if (!user) return null;
  return { user };
}

// Re-export createClient for callers that need direct Supabase access
export { createClient };