import type { AuthResult, AuthSession, SignInInput, SignUpInput } from "../types";

/**
 * Typed auth adapter interface (F-05/F-06).
 *
 * Implementations: MockAuthAdapter (no keys — seeded demo users) and
 * SupabaseAuthAdapter (NEXT_PUBLIC_SUPABASE_URL + anon key present).
 * The rest of the app depends only on this interface.
 */
export interface AuthAdapter {
  readonly mode: "supabase" | "mock";

  getSession(): Promise<AuthSession>;
  signIn(input: SignInInput): Promise<AuthResult>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** OAuth entry point; mock mode resolves to a demo user of the given role. */
  signInWithOAuth(provider: "google"): Promise<AuthResult>;
}
