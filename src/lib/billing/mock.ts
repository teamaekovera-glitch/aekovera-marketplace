import type {
  BillingAdapter,
  CheckoutResult,
  CheckoutSessionInput,
  ParsedStripeEvent,
} from "./types";

/**
 * Mock billing adapter (F-08/F-09) — active when STRIPE_SECRET_KEY is absent.
 * Simulates checkout with a local URL and accepts any webhook payload,
 * parsing it with the same normalizer the Stripe adapter uses after
 * verification, so downstream behavior is identical in tests.
 */

export class MockBillingAdapter implements BillingAdapter {
  readonly mode = "mock" as const;

  private sessions = new Map<string, CheckoutSessionInput>();

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutResult> {
    if (!["starter", "pro", "enterprise"].includes(input.plan)) {
      return { ok: false, error: `Plan ${input.plan} has no paid checkout.` };
    }
    const sessionId = `cs_mock_${input.plan}_${input.idempotencyKey ?? Date.now()}`;
    this.sessions.set(sessionId, input);
    return { ok: true, url: `${input.successUrl}?mock_checkout=${sessionId}` };
  }

  async createPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<CheckoutResult> {
    return { ok: true, url: `${input.returnUrl}?mock_portal=${input.customerId}` };
  }

  async verifyAndParseWebhook(payload: string): Promise<ParsedStripeEvent | null> {
    // Mock mode: no signature to verify; parse only.
    return parseStripeEventPayload(payload);
  }
}

/**
 * Shared normalizer from a Stripe event JSON body to ParsedStripeEvent.
 * Used by the mock adapter directly and by the Stripe adapter after
 * signature verification.
 */
export function parseStripeEventPayload(payload: string): ParsedStripeEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const event = parsed as {
    id?: unknown;
    type?: unknown;
    data?: { object?: Record<string, unknown> | null };
  };
  if (typeof event.id !== "string" || typeof event.type !== "string") return null;
  const obj = event.data?.object ?? {};

  switch (event.type) {
    case "checkout.session.completed": {
      const userId = typeof obj.client_reference_id === "string" ? obj.client_reference_id : "";
      const customerId = typeof obj.customer === "string" ? obj.customer : "";
      const subscriptionId = typeof obj.subscription === "string" ? obj.subscription : null;
      const metadataPlan =
        typeof (obj.metadata as Record<string, unknown> | undefined)?.plan === "string"
          ? ((obj.metadata as Record<string, string>).plan as string)
          : "";
      if (!userId || !customerId) return { id: event.id, type: event.type, data: { kind: "unknown", originalType: event.type } };
      return {
        id: event.id,
        type: event.type,
        data: {
          kind: "checkout_completed",
          userId,
          plan: isPaidPlanName(metadataPlan) ? metadataPlan : "starter",
          customerId,
          subscriptionId,
        },
      };
    }
    case "customer.subscription.updated": {
      const subscriptionId = typeof obj.id === "string" ? obj.id : "";
      const status = normalizeStatus(obj.status);
      const periodEnd = typeof obj.current_period_end === "number"
        ? new Date(obj.current_period_end * 1000)
        : null;
      if (!subscriptionId) {
        return { id: event.id, type: event.type, data: { kind: "unknown", originalType: event.type } };
      }
      return {
        id: event.id,
        type: event.type,
        data: { kind: "subscription_updated", subscriptionId, status, currentPeriodEnd: periodEnd },
      };
    }
    case "customer.subscription.deleted": {
      const subscriptionId = typeof obj.id === "string" ? obj.id : "";
      if (!subscriptionId) {
        return { id: event.id, type: event.type, data: { kind: "unknown", originalType: event.type } };
      }
      return {
        id: event.id,
        type: event.type,
        data: { kind: "subscription_deleted", subscriptionId },
      };
    }
    default:
      return { id: event.id, type: event.type, data: { kind: "unknown", originalType: event.type } };
  }
}

function isPaidPlanName(value: string): value is "starter" | "pro" | "enterprise" {
  return value === "starter" || value === "pro" || value === "enterprise";
}

function normalizeStatus(status: unknown): "active" | "past_due" | "canceled" {
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "active";
}
