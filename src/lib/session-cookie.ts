import type { AuthUser, UserRole } from "./types";

/**
 * Middleware-visible session cookie (F-06/F-14).
 *
 * Mock mode has no Supabase auth cookies, so sign-in writes a base64 JSON
 * session snapshot. The cookie is a routing hint only — every server page
 * re-derives the session through the auth adapter, and all data isolation is
 * enforced by PostgreSQL RLS, not by middleware.
 */

export const SESSION_COOKIE = "aeko_session";

export function encodeSessionCookie(user: AuthUser): string {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export type SessionRole =
  | { present: true; role: UserRole; userId: string }
  | { present: false };

export function decodeSessionCookie(value: string | undefined): SessionRole {
  if (!value) return { present: false };
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      id?: unknown;
      role?: unknown;
    };
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.role !== "string" ||
      !["brand", "buyer", "admin"].includes(parsed.role)
    ) {
      return { present: false };
    }
    return { present: true, role: parsed.role as UserRole, userId: parsed.id };
  } catch {
    return { present: false };
  }
}

/** Extract the role from a Supabase auth cookie JWT payload (unverified read). */
export function decodeSupabaseCookieRole(raw: string | undefined): SessionRole {
  if (!raw) return { present: false };
  try {
    // Supabase SSR cookies are base64-encoded JSON (or plain JSON) holding a
    // session object with an access_token JWT.
    let json = raw;
    if (!raw.startsWith("{")) {
      json = Buffer.from(raw, "base64").toString("utf8");
    }
    const session = JSON.parse(json) as { access_token?: string };
    if (!session.access_token) return { present: false };
    const [, payload] = session.access_token.split(".");
    if (!payload) return { present: false };
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      user_metadata?: { role?: unknown };
    };
    const role = claims.user_metadata?.role;
    if (typeof claims.sub !== "string" || typeof role !== "string") {
      return { present: false };
    }
    if (!["brand", "buyer", "admin"].includes(role)) return { present: false };
    return { present: true, role: role as UserRole, userId: claims.sub };
  } catch {
    return { present: false };
  }
}
