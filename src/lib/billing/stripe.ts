import Stripe from "stripe";
import { PLAN_FEATURES } from "../plans";
import type {
  BillingAdapter,
  CheckoutResult,
  CheckoutSessionInput,
  ParsedStripeEvent,
} from "./types";
import { parseStripeEventPayload } from "./mock";

/**
 * Stripe billing adapter (F-08/F-09) — active when STRIPE_SECRET_KEY exists.
 *
 * - Checkout uses Stripe Checkout Sessions with client_reference_id = userId
 *   and metadata.plan so checkout.session.completed can restore the plan.
 * - Webhook signature verification uses stripe.webhooks.constructEvent with
 *   STRIPE_WEBHOOK_SECRET (07 spec §5.2). Malformed or invalid-signature
 *   payloads return null and the route answers 400.
 */
export class StripeBillingAdapter implements BillingAdapter {
  readonly mode = "stripe" as const;

  private stripe: Stripe;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.stripe = new Stripe(secretKey);
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutResult> {
    const priceId = PLAN_FEATURES[input.plan].stripePriceId;
    if (!priceId) {
      return { ok: false, error: `Plan ${input.plan} has no Stripe price configured.` };
    }
    try {
      const session = await this.stripe.checkout.sessions.create(
        {
          mode: "subscription",
          client_reference_id: input.userId,
          customer_email: input.email,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: { plan: input.plan, userId: input.userId },
          subscription_data: { metadata: { plan: input.plan, userId: input.userId } },
        },
        input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
      );
      return session.url
        ? { ok: true, url: session.url }
        : { ok: false, error: "Stripe returned no checkout URL." };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Stripe checkout failed.",
      };
    }
  }

  async createPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<CheckoutResult> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: input.customerId,
        return_url: input.returnUrl,
      });
      return { ok: true, url: session.url };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Stripe portal failed.",
      };
    }
  }

  async verifyAndParseWebhook(
    payload: string,
    signature: string,
  ): Promise<ParsedStripeEvent | null> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
      // Reuse the shared normalizer for a consistent event shape.
      return parseStripeEventPayload(JSON.stringify(event));
    } catch {
      return null;
    }
  }
}
