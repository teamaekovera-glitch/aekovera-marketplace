import { Badge } from "@/components/ui/badge";
import { serviceMode } from "@/lib/env";
import { getRequiredUser } from "@/lib/session";

/**
 * Admin overview (F-15 shell). Buyer verification, moderation, and platform
 * analytics arrive in Phase 1.
 */
export default async function AdminOverviewPage() {
  const user = await getRequiredUser("admin");

  const integrations = [
    { label: "Auth", mode: serviceMode.supabaseAuth },
    { label: "Search", mode: serviceMode.search },
    { label: "Billing", mode: serviceMode.billing },
    { label: "Email", mode: serviceMode.email },
    { label: "Jobs", mode: serviceMode.jobs },
  ] as const;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform admin</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <Badge variant="accent">Admin</Badge>
      </header>

      <section aria-label="Integration modes" className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">Service modes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mock-first doctrine: every integration runs without keys; real keys
          activate adapters automatically.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <li
              key={i.label}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{i.label}</span>
              <Badge variant={i.mode === "mock" ? "secondary" : "success"}>{i.mode}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
