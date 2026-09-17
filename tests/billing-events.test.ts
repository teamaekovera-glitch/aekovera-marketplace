import { describe, expect, it } from "vitest";
import {
  applySubscriptionEvent,
  isEventProcessed,
} from "../src/lib/billing/events";
import {
  DEFAULT_SUBSCRIPTION_STATE,
  type ParsedStripeEvent,
  type SubscriptionState,
} from "../src/lib/billing/types";

const state: SubscriptionState = {
  ...DEFAULT_SUBSCRIPTION_STATE,
  plan: "starter",
  status: "active",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  currentPeriodEnd: new Date("2026-10-01T00:00:00Z"),
};

function event(data: ParsedStripeEvent["data"], id = "evt_1"): ParsedStripeEvent {
  return { id, type: `test.${data.kind}`, data };
}

describe("applySubscriptionEvent (F-09 webhook logic)", () => {
  it("checkout.session.completed activates the purchased plan", () => {
    const next = applySubscriptionEvent(
      event({
        kind: "checkout_completed",
        userId: "u1",
        plan: "pro",
        customerId: "cus_999",
        subscriptionId: "sub_777",
      }),
      DEFAULT_SUBSCRIPTION_STATE,
    );
    expect(next).toEqual({
      ...DEFAULT_SUBSCRIPTION_STATE,
      plan: "pro",
      status: "active",
      stripeCustomerId: "cus_999",
      stripeSubscriptionId: "sub_777",
    });
  });

  it("subscription update to past_due keeps the plan but flags payment", () => {
    const next = applySubscriptionEvent(
      event({
        kind: "subscription_updated",
        subscriptionId: "sub_123",
        status: "past_due",
        currentPeriodEnd: null,
      }),
      state,
    );
    expect(next?.plan).toBe("starter");
    expect(next?.status).toBe("past_due");
  });

  it("subscription cancellation downgrades to free", () => {
    const next = applySubscriptionEvent(
      event({ kind: "subscription_deleted", subscriptionId: "sub_123" }),
      state,
    );
    expect(next).toEqual({
      plan: "free",
      status: "canceled",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: null,
      currentPeriodEnd: state.currentPeriodEnd,
    });
  });

  it("unknown event types produce no state change", () => {
    expect(applySubscriptionEvent(event({ kind: "unknown", originalType: "invoice.paid" }), state)).toBeNull();
  });
});

describe("isEventProcessed (idempotency guard)", () => {
  it("detects already-applied event ids", () => {
    const seen = new Set(["evt_1"]);
    expect(isEventProcessed(seen, "evt_1")).toBe(true);
    expect(isEventProcessed(seen, "evt_2")).toBe(false);
  });
});
