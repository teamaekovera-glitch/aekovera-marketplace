import type { SubscriptionState } from "./types";
import type { ParsedStripeEvent, StripeEventData } from "./types";
import type { SubscriptionStatus } from "../types";

/**
 * Pure webhook application logic (F-09): maps a verified Stripe event to the
 * next SubscriptionState. Returns null for events that carry no state change
 * (unknown types, duplicates handled upstream).
 */
export function applySubscriptionEvent(
  event: ParsedStripeEvent,
  current: SubscriptionState,
): SubscriptionState | null {
  switch (event.data.kind) {
    case "checkout_completed": {
      return {
        ...current,
        plan: event.data.plan,
        status: "active",
        stripeCustomerId: event.data.customerId,
        stripeSubscriptionId: event.data.subscriptionId,
        currentPeriodEnd: current.currentPeriodEnd,
      };
    }
    case "subscription_updated": {
      const status: SubscriptionStatus = event.data.status;
      return {
        ...current,
        status: status === "canceled" && current.plan !== "free"
          ? current.status
          : status,
        stripeSubscriptionId: event.data.subscriptionId,
        currentPeriodEnd: event.data.currentPeriodEnd ?? current.currentPeriodEnd,
      };
    }
    case "subscription_deleted": {
      return {
        plan: "free",
        status: "canceled",
        stripeCustomerId: current.stripeCustomerId,
        stripeSubscriptionId: null,
        currentPeriodEnd: current.currentPeriodEnd,
      };
    }
    case "unknown":
      return null;
  }
}

/** True when this event id was already applied (idempotency guard). */
export function isEventProcessed(
  seenEventIds: ReadonlySet<string>,
  eventId: string,
): boolean {
  return seenEventIds.has(eventId);
}

export function describeEventData(data: StripeEventData): string {
  switch (data.kind) {
    case "checkout_completed":
      return `checkout for user ${data.userId} -> ${data.plan}`;
    case "subscription_updated":
      return `subscription ${data.subscriptionId} -> ${data.status}`;
    case "subscription_deleted":
      return `subscription ${data.subscriptionId} deleted`;
    case "unknown":
      return `unhandled event type: ${data.originalType}`;
  }
}
