import { Badge } from "@/components/ui/badge";
import { getRequiredUser } from "@/lib/session";

/**
 * Buyer dashboard (F-15 shell). Discovery, sourcing, and messaging arrive
 * in Phase 1.
 */
export default async function BuyerDashboardPage() {
  const user = await getRequiredUser("buyer");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-sm text-muted-foreground">Buyer workspace</p>
        </div>
        {!user.onboardingCompleted && <Badge variant="outline">Verification pending</Badge>}
      </header>

      <section aria-label="Getting started" className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">Start sourcing</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Post a sourcing opportunity and let verified brands come to you, or
          search the catalog with faceted filters for certifications,
          categories, and distribution regions.
        </p>
      </section>

      <section aria-label="Workspace" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Discover", body: "Search brands once your team verifies your account." },
          { title: "Sourcing", body: "No opportunities posted yet." },
          { title: "Saved", body: "Nothing saved yet." },
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
