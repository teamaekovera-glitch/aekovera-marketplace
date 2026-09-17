import type { PlanId } from "../types";

/**
 * Typed billing adapter interface (F-08/F-09).
 *
 * Implementations: MockBillingAdapter (no keys — simulated checkout) and
 * StripeBillingAdapter. Webhook consumption is split into two steps so the
 * signature-verification is testable and the application logic is pure:
 *  1. verifyAndParseWebhook(rawBody, signature) -> ParsedStripeEvent | null
 *  2. applySubscriptionEvent(event, current) -> SubscriptionState (pure)
 */

export interface CheckoutSessionInput {
  userId: string;
  email: string;
  plan: Exclude<PlanId, "free">;
  successUrl: string;
  cancelUrl: string;
  /** Client-supplied key to make session creation retry-safe. */
  idempotencyKey?: string;
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Normalized subscription state stored on brand_profiles / user_profiles. */
export interface SubscriptionState {
  plan: PlanId;
  status: "none" | "active" | "past_due" | "canceled";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}

export const DEFAULT_SUBSCRIPTION_STATE: SubscriptionState = {
  plan: "free",
  status: "none",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
};

export interface ParsedStripeEvent {
  id: string;
  type: string;
  data: StripeEventData;
}

export type StripeEventData =
  | { kind: "checkout_completed"; userId: string; plan: PlanId; customerId: string; subscriptionId: string | null }
  | { kind: "subscription_updated"; subscriptionId: string; status: "active" | "past_due" | "canceled"; currentPeriodEnd: Date | null }
  | { kind: "subscription_deleted"; subscriptionId: string }
  | { kind: "unknown"; originalType: string };

export interface BillingAdapter {
  readonly mode: "stripe" | "mock";

  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutResult>;
  createPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<CheckoutResult>;
  verifyAndParseWebhook(payload: string, signature: string): Promise<ParsedStripeEvent | null>;
}
