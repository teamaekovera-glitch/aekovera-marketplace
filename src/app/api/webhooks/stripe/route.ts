import { NextResponse, type NextRequest } from "next/server";
import {
  applySubscriptionEvent,
  createBillingAdapter,
  describeEventData,
  isEventProcessed,
} from "@/lib/billing";
import type { SubscriptionState } from "@/lib/billing/types";

/**
 * Stripe webhook handler (F-09) — checkout.session.completed and
 * subscription lifecycle events.
 *
 * Signature verification (or mock-mode parse) → idempotency check → pure
 * state application. The processed-event ledger (processed_webhook_events
 * table) makes delivery retries no-ops once persistence wiring lands in
 * Phase 1; the seen-set here is process-local in Phase 0.
 */
export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const billing = createBillingAdapter();
  const event = await billing.verifyAndParseWebhook(payload, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature or payload." }, { status: 400 });
  }

  if (isEventProcessed(PROCESSED_EVENT_IDS, event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const current: SubscriptionState = {
    plan: "free",
    status: "none",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
  };
  const next = applySubscriptionEvent(event, current);
  if (!next) {
    return NextResponse.json({ received: true, ignored: describeEventData(event.data) });
  }

  // Phase 0: the transition is computed and logged; the brand_profiles write
  // executes where the persistence layer wires in (Phase 1).
  console.log(`[stripe:webhook] ${event.type}: ${describeEventData(event.data)}`);

  return NextResponse.json({ received: true, applied: describeEventData(event.data) });
}

/** Phase 0 in-memory idempotency seed; durable store lands with Phase 1 persistence. */
const PROCESSED_EVENT_IDS: ReadonlySet<string> = new Set<string>();

export const dynamic = "force-dynamic";
