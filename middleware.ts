import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  decodeSessionCookie,
  decodeSupabaseCookieRole,
} from "@/lib/session-cookie";
import type { UserRole } from "@/lib/types";

/**
 * Role middleware (F-06/F-14): detects the signed-in role and routes
 * /brand/*, /buyer/*, and /admin/* to the right audience.
 *
 * The cookie read is a routing hint only — server pages re-derive the real
 * session via the auth adapter, and all data isolation is enforced by RLS.
 */

const PROTECTED_PREFIXES = ["/brand", "/buyer", "/admin"] as const;
const AUTH_PAGES = ["/signin", "/signup"];
const PUBLIC_PREFIXES = [
  "/api/webhooks",
  "/api/health",
  "/auth",
  "/_next",
  "/favicon",
  "/icons",
  "/images",
];

/** Home route per role; admin can enter any role area, roles cannot cross. */
const ROLE_HOME: Record<UserRole, string> = {
  brand: "/brand",
  buyer: "/buyer",
  admin: "/admin",
};

function resolveRole(request: NextRequest): UserRole | null {
  const fromSession = decodeSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
  if (fromSession.present) return fromSession.role;
  const supabaseCookie = request.cookies
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  const fromSupabase = decodeSupabaseCookieRole(supabaseCookie?.value);
  return fromSupabase.present ? fromSupabase.role : null;
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const role = resolveRole(request);

  // Signed-in users bypass the auth pages.
  if (role && AUTH_PAGES.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (!isProtected(pathname)) return NextResponse.next();

  if (!role) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  const area = pathname.split("/")[1] as UserRole | "api" | "auth";
  if (area === "admin") {
    // Only admins enter /admin/*; other roles go to their own home.
    if (role !== "admin") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
  } else if (area === "brand" || area === "buyer") {
    if (role !== area && role !== "admin") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Public prefixes stay excluded; everything else (including protected
  // areas and auth pages) passes through the role check above.
  matcher: [
    "/((?!api/webhooks|api/health|auth|_next/static|_next/image|favicon|icons|images).*)",
  ],
};
