import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;

  // Routes protégées par rôle
  const protectedRoutes: Record<string, string[]> = {
    "/pro": ["PRO_OWNER", "PRO_STAFF", "ADMIN"],
    "/admin": ["ADMIN"],
    "/account": ["CONSUMER", "PRO_OWNER", "PRO_STAFF", "ADMIN"],
  };

  for (const [prefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      if (!session || !userRole || !allowedRoles.includes(userRole)) {
        const url = new URL("/connexion", request.url);
        url.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
