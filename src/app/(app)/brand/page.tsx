import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlanFeatures } from "@/lib/plans";
import { getRequiredUser } from "@/lib/session";

/**
 * Brand dashboard (F-15 shell). Phase 0 ships the layout and plan context;
 * catalog, opportunities, and analytics land in Phase 1.
 */
export default async function BrandDashboardPage() {
  const user = await getRequiredUser("brand");
  const plan = getPlanFeatures(user.plan);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-sm text-muted-foreground">Brand workspace</p>
        </div>
        <Badge variant="accent">{plan.label} plan</Badge>
      </header>

      <section
        aria-label="Getting started"
        className="rounded-lg border bg-card p-6"
      >
        <h2 className="font-semibold">Get discovered</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your profile is what buyers evaluate: catalog, certifications,
          distribution regions, and MOQ. Completing it unlocks AI-assisted
          matching against live sourcing opportunities.
        </p>
        <div className="mt-4">
          <Button variant="accent" size="sm">
            <Link href="/brand/profile" className="text-sm">
              Complete brand profile
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Workspace" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Products", body: "Your catalog is empty. Add your first product." },
          { title: "Opportunities", body: "No open opportunities match your categories yet." },
          { title: "Messages", body: plan.messaging ? "No conversations yet." : "Messaging unlocks with a paid plan." },
        ].map((card) => (
          <article key={card.title} className="rounded-lg border bg-card p-5">
            <h3 className="font-medium">{card.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
