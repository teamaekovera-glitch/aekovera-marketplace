"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthAdapter } from "@/lib/auth";
import { SESSION_COOKIE, encodeSessionCookie } from "@/lib/session-cookie";
import type { UserRole } from "@/lib/types";

/**
 * Auth server actions: sign-in/sign-up through the typed adapter, then stage
 * the middleware-visible session cookie. In mock mode the adapter resolves
 * seeded demo users; with Supabase keys the adapter handles the real flow.
 */

function safeNextPath(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const adapter = createAuthAdapter();
  const result = await adapter.signIn({ email, password });
  if (!result.ok) {
    redirect(`/signin?error=${encodeURIComponent(result.error)}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  const session = await adapter.getSession();
  if (session?.user) {
    const store = await cookies();
    store.set(SESSION_COOKIE, encodeSessionCookie(session.user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  redirect(next || (result.role === "buyer" ? "/buyer" : result.role === "admin" ? "/admin" : "/brand"));
}

export async function signUpAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const roleInput = String(formData.get("role") ?? "brand");
  const role: UserRole = roleInput === "buyer" ? "buyer" : "brand";

  const adapter = createAuthAdapter();
  const result = await adapter.signUp({
    email,
    password,
    role,
    displayName: displayName || undefined,
  });
  if (!result.ok) {
    redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  }
  redirect(role === "buyer" ? "/buyer" : "/brand");
}

export async function signOutAction(): Promise<void> {
  const adapter = createAuthAdapter();
  await adapter.signOut();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
