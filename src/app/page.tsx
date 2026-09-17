import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { PLAN_FEATURES } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

/**
 * Landing page (F-01). Public marketing page; role areas live under
 * /brand, /buyer, /admin behind the middleware and the shared layout shell.
 */

const VALUE_PROPS = [
  {
    title: "Retailer-ready brand profiles",
    body: "Structured catalogs, certifications, distribution regions, and MOQs — everything a buyer needs to evaluate a line, in one profile.",
  },
  {
    title: "Sourcing opportunities",
    body: "Buyers post exactly what they're sourcing. Brands see the brief, pitch the right SKUs, and track their submission end-to-end.",
  },
  {
    title: "AI-assisted matching",
    body: "Deterministic scoring plus AI summaries surface the strongest brand-buyer pairs — no more directory dead-ends.",
  },
  {
    title: "Verified trust signals",
    body: "Buyer verification, certification records, and full analytics give both sides the confidence to move fast.",
  },
] as const;

const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "enterprise"];

function formatPrice(cents: number | null): string {
  if (cents === null) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Aekovera
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-3">
            <Link href="/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
            <Button variant="accent" size="sm">
              <Link href="/signup" className="text-sm">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-3xl">
              <Badge variant="accent" className="mb-4">
                B2B marketplace for CPG
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Where CPG brands meet retail buyers
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Aekovera replaces the trade-show scramble with a living marketplace:
                verified buyers discover brands through structured profiles and
                AI-assisted matching, and brands get discovered by the right
                shelves.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="accent" size="lg">
                  <Link href="/signup?role=brand" className="text-sm font-medium">
                    List your brand
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Link href="/signup?role=buyer" className="text-sm font-medium">
                    Source as a buyer
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Demo accounts are seeded in mock mode — sign in as a brand,
                buyer, or admin to explore.
              </p>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built for how CPG buying actually works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {VALUE_PROPS.map((prop) => (
              <article
                key={prop.title}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {prop.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section className="border-t bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Simple annual pricing
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start free. Upgrade when your catalog is ready for prime time.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLAN_ORDER.map((planId) => {
                const plan = PLAN_FEATURES[planId];
                return (
                  <article
                    key={plan.id}
                    className="flex flex-col rounded-lg border bg-card p-6 shadow-sm"
                  >
                    <h3 className="font-semibold">{plan.label}</h3>
                    <p className="mt-2 text-3xl font-bold">
                      {formatPrice(plan.yearlyPriceCents)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.yearlyPriceCents === null ? "" : "/yr"}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li>
                        {plan.maxProducts === null
                          ? "Unlimited products"
                          : `${plan.maxProducts} products`}
                      </li>
                      <li>
                        {plan.submissionQuota.monthlyLimit === null
                          ? "Unlimited submissions"
                          : `${plan.submissionQuota.monthlyLimit} submissions/mo`}
                      </li>
                      <li>{plan.messaging ? "Messaging included" : "No messaging"}</li>
                      <li className="capitalize">
                        {plan.searchVisibility} search visibility
                      </li>
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Aekovera. All rights reserved.</p>
          <p>
            Phase 0 foundation · mock-first build (no external keys required)
          </p>
        </div>
      </footer>
    </div>
  );
}
