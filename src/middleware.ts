import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getRateLimiter,
  getAuthRateLimiter,
  getRateLimitIdentifier,
  checkRateLimit,
} from "@/lib/rate-limit";

// Routes avec rate limiting spécifique
const AUTH_API_ROUTES = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];
const UPLOAD_ROUTES = ["/api/v1/upload", "/api/v1/salons"];

// Protected routes requiring authentication
const PROTECTED_ROUTES = ["/mes-rendez-vous", "/parametres"];

// Auth routes that should skip Supabase session refresh (prevents redirect loops)
const AUTH_ROUTES = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe", "/verification-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Skip Supabase session refresh for auth pages to prevent redirect loops
  // Auth pages don't need authenticated user context
  const isAuthPage = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  let user: Awaited<ReturnType<typeof updateSession>>["user"] | undefined = undefined;
  let supabaseResponse: NextResponse;

  if (isAuthPage) {
    // No session refresh needed for login/register pages
    supabaseResponse = NextResponse.next({ request });
  } else {
    // Supabase session refresh + user extraction
    const result = await updateSession(request);
    supabaseResponse = result.supabaseResponse;
    user = result.user;
  }

  // Rate limiting for API routes (skip for static/auth pages)
  if (pathname.startsWith("/api/")) {
    const identifier = getRateLimitIdentifier(request);

    if (AUTH_API_ROUTES.some((route) => pathname.startsWith(route))) {
      const authLimiter = getAuthRateLimiter();
      const rateLimitResponse = await checkRateLimit(identifier, authLimiter);
      if (rateLimitResponse) return rateLimitResponse;
    }

    if (
      pathname.startsWith("/api/v1/") &&
      !AUTH_API_ROUTES.some((route) => pathname.startsWith(route))
    ) {
      const limiter = getRateLimiter();
      const rateLimitResponse = await checkRateLimit(identifier, limiter);
      if (rateLimitResponse) return rateLimitResponse;
    }
  }

  // Auth guard: require authentication for protected account routes and /pro
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isProRoute = pathname.startsWith("/pro");

  if ((isProtectedRoute || isProRoute) && !user) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role guard: /pro routes require PRO_OWNER, PRO_STAFF, or ADMIN
  // Allow /pro/inscription (onboarding) for authenticated users of any role
  const isProOnboarding = pathname.startsWith("/pro/inscription");
  const userRole = user?.user_metadata?.role as string | undefined;

  if (isProRoute && !isProOnboarding && userRole === "CONSUMER") {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(homeUrl);
  }

  // Ajouter les headers de sécurité
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  supabaseResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // CSP strict (sans unsafe-inline pour pages)
  if (!pathname.startsWith("/api")) {
    // Generate nonce for scripts
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    supabaseResponse.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
        "style-src 'self' 'unsafe-inline'", // Tailwind needs this
        "img-src 'self' data: https: blob: *.tile.openstreetmap.org",
        "font-src 'self' data:",
        "connect-src 'self' https://api.resend.com https://o448957.ingest.sentry.io https://challenges.cloudflare.com",
        "frame-src 'self' https://challenges.cloudflare.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; "),
    );

    // Add nonce to request for use in pages
    supabaseResponse.headers.set("x-nonce", nonce);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};