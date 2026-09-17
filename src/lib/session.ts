import { redirect } from "next/navigation";
import { createAuthAdapter } from "./auth";
import type { AuthUser, UserRole } from "./types";

/**
 * Server-side session access for pages and layouts. Middleware performs a
 * cookie-based routing pre-check; this is the real session read.
 */

export async function getUser(): Promise<AuthUser | null> {
  const adapter = createAuthAdapter();
  const session = await adapter.getSession();
  return session?.user ?? null;
}

/**
 * Require a signed-in user, optionally with a specific role. Redirects to
 * sign-in (unauthenticated) or the user's role home (wrong role).
 */
export async function getRequiredUser(role?: UserRole): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    redirect("/signin");
  }
  if (role && user.role !== role && user.role !== "admin") {
    redirect(user.role === "buyer" ? "/buyer" : user.role === "brand" ? "/brand" : "/admin");
  }
  return user;
}
