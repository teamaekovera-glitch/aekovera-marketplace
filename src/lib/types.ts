/**
 * Core domain types shared across adapters and app layers.
 */

export const USER_ROLES = ["brand", "buyer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PLANS = ["free", "starter", "pro", "enterprise"] as const;
export type PlanId = (typeof PLANS)[number];

export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

/** The user identity consumed by middleware, layouts, and gating logic. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  onboardingCompleted: boolean;
}

export type AuthSession = { user: AuthUser } | null;

export interface SignUpInput {
  email: string;
  password: string;
  role: UserRole;
  displayName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export type AuthResult =
  | { ok: true; userId: string; email: string; role: UserRole }
  | { ok: false; error: string };
