import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
// Request is a global type in Next.js API routes

export type UserRole = "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  locale: string;
}

/**
 * Parse cookies from a Request object's Cookie header.
 * Returns a Map of cookie name → value.
 */
function parseCookiesFromRequest(request: Request): Map<string, string> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      cookies.set(trimmed.substring(0, eqIndex), trimmed.substring(eqIndex + 1));
    }
  }
  return cookies;
}

/**
 * Validate a Supabase access token and return the auth user,
 * with fallback to refresh token if access token is expired/invalid.
 */
async function validateTokenAndFetchUser(
  accessToken: string,
  refreshToken?: string,
): Promise<AuthUser | null> {
  // Try access token first
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (!error && data.user) {
    // Fetch profile from DB
    const { data: profile } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, locale")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: profile.email ?? data.user.email ?? "",
        role: (profile.role as UserRole) ?? "CONSUMER",
        name: profile.name ?? null,
        locale: profile.locale ?? "FR",
      };
    }

    // Fallback to metadata
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      role: (data.user.user_metadata?.role as UserRole) ?? "CONSUMER",
      name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? null,
      locale: (data.user.user_metadata?.locale as string) ?? "FR",
    };
  }

  // Access token failed — try refresh token
  if (refreshToken) {
    const { data: refreshData, error: refreshError } =
      await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (!refreshError && refreshData.user) {
      const { data: profile } = await supabaseAdmin
        .from("User")
        .select("id, email, name, role, locale")
        .eq("email", refreshData.user.email)
        .single();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email ?? refreshData.user.email ?? "",
          role: (profile.role as UserRole) ?? "CONSUMER",
          name: profile.name ?? null,
          locale: profile.locale ?? "FR",
        };
      }

      return {
        id: refreshData.user.id,
        email: refreshData.user.email ?? "",
        role: (refreshData.user.user_metadata?.role as UserRole) ?? "CONSUMER",
        name: refreshData.user.user_metadata?.name ?? null,
        locale: (refreshData.user.user_metadata?.locale as string) ?? "FR",
      };
    }
  }

  return null;
}

/**
 * Get the current authenticated user.
 *
 * In API routes (Route Handlers), pass the Request object so we can
 * read cookies directly from the request header — this is more reliable
 * than next/headers cookies() in Vercel serverless functions.
 *
 * In Server Components / Server Actions (no Request available), omit the
 * request parameter and we'll fall back to next/headers cookies().
 */
export async function getUser(request?: Request): Promise<AuthUser | null> {
  // Strategy 1: If a Request is provided, read cookies from the header directly.
  // This is the most reliable method in Vercel serverless API routes.
  if (request) {
    const cookieMap = parseCookiesFromRequest(request);
    const accessToken = cookieMap.get("sb-access-token");
    const refreshToken = cookieMap.get("sb-refresh-token");

    if (accessToken) {
      const user = await validateTokenAndFetchUser(accessToken, refreshToken);
      if (user) return user;
    }
  }

  // Strategy 2: Fall back to next/headers cookies() (works in Server Components,
  // Server Actions, and when middleware has already processed the request).
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
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
    }
  } catch {
    // next/headers may throw if called outside a request context
  }

  // Strategy 3: Last resort — if we have a Request but Strategy 1 failed,
  // try reading just the cookie values (can happen if AT is expired
  // and RT refresh also failed — truly unauthenticated).
  return null;
}