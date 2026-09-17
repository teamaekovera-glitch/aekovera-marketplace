import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";
import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
  UserRole,
} from "../types";
import type { AuthAdapter } from "./types";

/**
 * Supabase Auth adapter (F-05/F-06) — active when Supabase env keys exist.
 *
 * Uses the SSR cookie-based flow. user_profiles.role is the source of truth
 * for role routing; profile creation happens via DB trigger on auth.users
 * insert (migration 0001).
 */

export class SupabaseAuthAdapter implements AuthAdapter {
  readonly mode = "supabase" as const;

  private async getClient() {
    // The factory only constructs this adapter with keys present; a missing
    // key here means a misconfigured factory call, which must fail loudly
    // rather than hand an empty string to the Supabase client.
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new Error(
        "SupabaseAuthAdapter requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (use createAuthAdapter to select the mock in their absence)",
      );
    }
    const cookieStore = await cookies();
    return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          for (const { name, value, options } of all) {
            cookieStore.set(name, value, options);
          }
        },
      },
    });
  }

  async getSession(): Promise<AuthSession> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, display_name, avatar_url, onboarding_completed")
      .eq("id", data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        role: (profile?.role as UserRole | undefined) ?? "brand",
        displayName: profile?.display_name ?? data.user.email ?? "User",
        avatarUrl: profile?.avatar_url ?? null,
        plan: "free",
        subscriptionStatus: "none",
        onboardingCompleted: profile?.onboarding_completed ?? false,
      },
    };
  }

  async signIn({ email, password }: SignInInput): Promise<AuthResult> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Sign-in failed." };
    }
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    const role = (profile?.role as UserRole | undefined) ?? "brand";
    return { ok: true, userId: data.user.id, email, role };
  }

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { role: input.role, display_name: input.displayName ?? null },
      },
    });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Sign-up failed." };
    }
    return { ok: true, userId: data.user.id, email: input.email, role: input.role };
  }

  async signOut(): Promise<void> {
    const supabase = await this.getClient();
    await supabase.auth.signOut();
  }

  async signInWithOAuth(provider: "google"): Promise<AuthResult> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    // OAuth is a redirect flow; the session materializes at /auth/callback.
    return {
      ok: true,
      userId: "",
      email: data?.url ? "pending-oauth" : "",
      role: "brand",
    };
  }
}
