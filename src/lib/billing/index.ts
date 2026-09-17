import { env, serviceMode } from "../env";
import { MockBillingAdapter } from "./mock";
import { StripeBillingAdapter } from "./stripe";
import type { BillingAdapter } from "./types";

/**
 * Billing adapter factory (F-08/F-09): Stripe when keys exist, otherwise the
 * mock — mock-first doctrine.
 */
export function createBillingAdapter(): BillingAdapter {
  return serviceMode.billing === "stripe"
    ? new StripeBillingAdapter(env.stripeSecretKey, env.stripeWebhookSecret)
    : new MockBillingAdapter();
}

export {
  applySubscriptionEvent,
  describeEventData,
  isEventProcessed,
} from "./events";
export { parseStripeEventPayload } from "./mock";
export { DEFAULT_SUBSCRIPTION_STATE } from "./types";
export type {
  BillingAdapter,
  CheckoutResult,
  CheckoutSessionInput,
  ParsedStripeEvent,
  SubscriptionState,
} from "./types";
