import type {
  AuthResult,
  AuthSession,
  AuthUser,
  PlanId,
  SignInInput,
  SignUpInput,
  UserRole,
} from "../types";
import type { AuthAdapter } from "./types";

/**
 * Mock auth adapter (F-05/F-06) — active when Supabase keys are absent.
 *
 * Serves the three seeded demo users required by the execution plan
 * (brand, buyer, admin) plus a demo Google OAuth entry point. State is
 * in-memory and per-process; every demo account signs in with its seeded
 * password ("demo1234").
 */

export interface MockUserRecord {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  plan: PlanId;
  onboardingCompleted: boolean;
}

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "brand@demo.aekovera.com",
    password: "demo1234",
    role: "brand",
    displayName: "Harbor & Vine Foods",
    plan: "pro",
    onboardingCompleted: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "buyer@demo.aekovera.com",
    password: "demo1234",
    role: "buyer",
    displayName: "Meridian Grocery Group",
    plan: "free",
    onboardingCompleted: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "admin@demo.aekovera.com",
    password: "demo1234",
    role: "admin",
    displayName: "Aekovera Platform Admin",
    plan: "free",
    onboardingCompleted: true,
  },
];

export function toAuthUser(record: MockUserRecord): AuthUser {
  return {
    id: record.id,
    email: record.email,
    role: record.role,
    displayName: record.displayName,
    avatarUrl: null,
    plan: record.plan,
    subscriptionStatus: record.plan === "free" ? "none" : "active",
    onboardingCompleted: record.onboardingCompleted,
  };
}

/** In-memory session store (per server process). */
const sessions = new Map<string, AuthUser>();

function findUserByEmail(email: string): MockUserRecord | undefined {
  return MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export class MockAuthAdapter implements AuthAdapter {
  readonly mode = "mock" as const;

  async getSession(): Promise<AuthSession> {
    // Mock mode keeps one implicit "current" session per process for the demo
    // experience; server components read it, middleware reads role claims.
    const current = [...sessions.values()].at(-1);
    return current ? { user: current } : null;
  }

  async signIn({ email, password }: SignInInput): Promise<AuthResult> {
    const record = findUserByEmail(email);
    if (!record || record.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const user = toAuthUser(record);
    sessions.set(record.id, user);
    return {
      ok: true,
      userId: record.id,
      email: record.email,
      role: record.role,
    };
  }

  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (findUserByEmail(input.email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (input.password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    const record: MockUserRecord = {
      id: `00000000-0000-4000-8000-${String(sessions.size + 10).padStart(12, "0")}`,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: input.role,
      displayName: input.displayName ?? input.email.split("@")[0] ?? input.email,
      plan: "free",
      onboardingCompleted: false,
    };
    MOCK_USERS.push(record);
    sessions.set(record.id, toAuthUser(record));
    return {
      ok: true,
      userId: record.id,
      email: record.email,
      role: record.role,
    };
  }

  async signOut(): Promise<void> {
    sessions.clear();
  }

  async signInWithOAuth(provider: "google"): Promise<AuthResult> {
    // Mock Google sign-in: resolves to the demo brand user (F-06 contract).
    if (provider !== "google") {
      return { ok: false, error: `Unsupported OAuth provider: ${provider}` };
    }
    const record = MOCK_USERS[0];
    if (!record) {
      return { ok: false, error: "No demo users seeded." };
    }
    const user = toAuthUser(record);
    sessions.set(record.id, user);
    return {
      ok: true,
      userId: record.id,
      email: record.email,
      role: record.role,
    };
  }
}
