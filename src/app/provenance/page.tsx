import Link from "next/link";
import type { Metadata } from "next";

import { UNKNOWN_LABEL } from "@/components/catalog/unknown-field";
import { quarantinedCount } from "@/lib/catalog/display";
import { regionalDatasets } from "@/lib/catalog/merge";
import { taxonomyData, taxonomyStats } from "@/lib/taxonomy";

/**
 * Provenance methodology page (spec F-05): documents the evidence tiers, the
 * open-the-URL audit standard, and known coverage gaps. Prose quotes and
 * tables transcribe the Provenance Rulebook (art_lD3jEqrv, v1.0); every number
 * is computed from the merged catalog or the taxonomy dataset at build time.
 */

export const metadata: Metadata = {
  title: "How we verify",
  description:
    "The provenance standard behind every claim in the Aekovera ingredient catalog: evidence tiers, confidence levels, the open-the-URL audit, and known coverage gaps.",
};

const SOURCE_TIERS = [
  {
    tier: "T1",
    name: "First-party official",
    covers:
      "Government registries, certifier databases, exchange/intergovernmental price series, the supplier's own site and documents.",
    standing: "Strongest evidence; the only tier that can establish existence and certification.",
  },
  {
    tier: "T2",
    name: "Official market reference",
    covers:
      "Commodity price series and official statistical aggregates (ICO, ICCO, ISO, World Bank); paid price-reporting agencies sit here but are gated.",
    standing: "Reference prices, never offers.",
  },
  {
    tier: "T3",
    name: "Third-party marketplace/directory",
    covers: "Listed prices and profiles on Alibaba, IndiaMART, Made-in-China, Thomas, Kompass.",
    standing: "Indicative only; discovery and screening.",
  },
  {
    tier: "T4",
    name: "Review platforms",
    covers: "Trustpilot, Google Business Profile, BBB, Yelp.",
    standing: "Ratings only, with platform rules applied.",
  },
  {
    tier: "G",
    name: "Gated",
    covers: "Paywalled or login-walled sources.",
    standing: "Marked gated; values are never republished as public.",
  },
  {
    tier: "F",
    name: "Forbidden",
    covers: "Sources the rulebook lists under its fabrication prohibitions (rule D6).",
    standing: "Never used.",
  },
] as const;

const STALENESS = [
  { field: "Tier 1 supplier-published prices", window: "90 days" },
  { field: "Tier 3 marketplace-listed prices", window: "30 days" },
  { field: "Ratings and reviews", window: "90 days" },
  { field: "Certifications", window: "On expiry, or 12 months" },
  { field: "Contact details", window: "12 months" },
  { field: "Existence / registry status", window: "12 months" },
] as const;

export default function ProvenancePage() {
  const allRows = regionalDatasets.flatMap((dataset) => dataset.suppliers);
  const withheldRows = quarantinedCount(allRows);
  const stats = taxonomyStats();
  const coverageGaps = regionalDatasets
    .filter((dataset) => dataset.coverageGaps && dataset.coverageGaps.length > 0)
    .map((dataset) => ({
      region: dataset.region,
      gaps: dataset.coverageGaps ?? [],
    }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Aekovera
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Ingredient Marketplace
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
            <Link href="/suppliers" className="text-muted-foreground hover:text-foreground">
              Suppliers
            </Link>
            <Link href="/provenance" className="text-foreground">
              Provenance
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b bg-secondary/40">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How we verify</h1>
            <p className="mt-4 text-muted-foreground">
              Every supplier row in this catalog is governed by our provenance
              rulebook (v1.0, September 19, 2026). Its standard, in its own words:
            </p>
            <blockquote className="mt-4 border-l-4 border-accent bg-card p-4 text-sm leading-relaxed">
              Every fact on a supplier row carries a source URL, an as-of date, and
              a confidence level — or it is marked Unknown. Nothing is inferred,
              rounded into existence, or borrowed from a weaker source while wearing
              a stronger source&apos;s label. A row is publishable only if an auditor
              can re-check every claim on it by opening the source URL. Anything
              that cannot pass that test does not ship.
            </blockquote>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Evidence tiers */}
          <section aria-labelledby="evidence-tiers">
            <h2 id="evidence-tiers" className="text-2xl font-semibold tracking-tight">
              Evidence tiers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every claim inherits the tier of its source, and the tier is part of
              the claim&apos;s label. Weaker sources never overwrite stronger ones.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table data-testid="tier-table" className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="py-2 pr-3">Tier</th>
                    <th scope="col" className="py-2 pr-3">Name</th>
                    <th scope="col" className="py-2 pr-3">What it covers</th>
                    <th scope="col" className="py-2">Standing</th>
                  </tr>
                </thead>
                <tbody>
                  {SOURCE_TIERS.map((tier) => (
                    <tr key={tier.tier} className="border-b align-top">
                      <td className="py-3 pr-3 font-semibold tabular-nums">{tier.tier}</td>
                      <td className="py-3 pr-3 font-medium">{tier.name}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{tier.covers}</td>
                      <td className="py-3 text-muted-foreground">{tier.standing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Confidence */}
          <section aria-labelledby="confidence" className="mt-12">
            <h2 id="confidence" className="text-2xl font-semibold tracking-tight">
              Confidence levels
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>
                <strong>High</strong> — the claim traces to a T1 source, the source
                was open and readable at the as-of date, and the status was current.
              </li>
              <li>
                <strong>Medium</strong> — the claim traces to a single T2 or T3
                source that supports it, with no second source and no contradiction
                found.
              </li>
              <li>
                <strong>Low</strong> — the claim is supplier-communicated only, with
                no independent registry or published evidence — or it is a derived
                value, or its staleness window has lapsed pending re-check.
              </li>
              <li>
                <strong>Medium-High</strong> — an intermediate label in the
                catalog&apos;s data model, sitting between High and Medium.
              </li>
            </ul>
          </section>

          {/* Unknowns */}
          <section aria-labelledby="unknowns" className="mt-12">
            <h2 id="unknowns" className="text-2xl font-semibold tracking-tight">
              Unknown is a state, not a gap
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              &ldquo;We looked and found nothing&rdquo; is recorded as Unknown — never
              as a blank, a zero, or an inferred value. Every unknown field in this
              catalog renders with one exact label:
            </p>
            <p className="mt-4">
              <code
                data-testid="unknown-label"
                className="rounded bg-secondary px-2 py-1 text-sm font-medium"
              >
                {UNKNOWN_LABEL}
              </code>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Absence of a public rating is displayed as &ldquo;No public
              rating&rdquo; — never as 0.0. Self-reported facts keep their sourcing
              verb: &ldquo;States a capacity of … (supplier-communicated,
              [date])&rdquo;, at confidence Low.
            </p>
          </section>

          {/* Certifications */}
          <section aria-labelledby="certifications" className="mt-12">
            <h2 id="certifications" className="text-2xl font-semibold tracking-tight">
              Certifications: company-stated, by default
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              In v1 every certification on a supplier row — however official the
              supplier&apos;s page looks — is labeled{" "}
              <strong>Company-stated</strong>. Nothing in this catalog renders as
              &ldquo;Verified&rdquo; until a registry or certifier database confirms
              it; registry verification is a per-certificate upgrade path for later
              versions. Expired, suspended, or revoked credentials are labeled as
              such with their dates — never silently dropped. A certification claim
              carries the registry URL or certifier-issued document, the certificate
              ID, its scope, status, expiry, and the as-of date.
            </p>
          </section>

          {/* Prices */}
          <section aria-labelledby="prices" className="mt-12">
            <h2 id="prices" className="text-2xl font-semibold tracking-tight">
              Prices: labeled by tier, quote-only by default
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong>Published — supplier</strong> (strongest): a price list on the
                supplier&apos;s own site, an official company PDF, or a written
                quotation to Aekovera. The only tier shown as a supplier&apos;s offer.
              </li>
              <li>
                <strong>Market reference</strong>: official intergovernmental or
                exchange series (ICO, ICCO, ISO, World Bank). Rendered visually
                distinct, never presented as what this supplier charges.
              </li>
              <li>
                <strong>Listed — [marketplace]</strong>: seller-uploaded ranges on B2B
                marketplaces — indicative, negotiable, frequently not transacted
                prices. Never shown with the weight of a published price.
              </li>
              <li>
                <strong>Quote-only</strong> is the default state. If no evidence at
                the required tier exists, no price is shown. Most fields in this
                catalog are quote-only — that is the honest state.
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Units and currency are recorded exactly as the source states them.
              Comparison views compare within a tier only. Published prices carry a
              90-day freshness window; marketplace listings 30 days — beyond the
              window, the label flips to recheck-in-progress.
            </p>
          </section>

          {/* Audit standard */}
          <section aria-labelledby="audit" className="mt-12">
            <h2 id="audit" className="text-2xl font-semibold tracking-tight">
              The audit standard: open the URL
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An auditor — anyone — must be able to re-check any claim by opening
              its source URL and seeing the claim supported, within two minutes,
              using nothing but the URL, the as-of date, and the archived
              screenshot. New rows are audited at 100% before publication;
              published rows at a 10% monthly sample. A row passes only with zero
              failed claims — any failed claim pulls the row or relabels it within
              24 hours. Every row keeps an append-only log: who checked, what URL,
              when, what changed.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table data-testid="staleness-table" className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="py-2 pr-3">Field type</th>
                    <th scope="col" className="py-2">Re-verify</th>
                  </tr>
                </thead>
                <tbody>
                  {STALENESS.map((row) => (
                    <tr key={row.field} className="border-b">
                      <td className="py-2 pr-3">{row.field}</td>
                      <td className="py-2 text-muted-foreground">{row.window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quarantine */}
          <section aria-labelledby="quarantine" className="mt-12">
            <h2 id="quarantine" className="text-2xl font-semibold tracking-tight">
              Withheld rows
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {withheldRows} supplier rows in the current research corpus are
              withheld from this catalog pending verification. Withholding is
              reason-bearing, never a silent drop: the documented reasons are
              marketplace-tier listings (business facts self-reported to a B2B
              platform, official site not fetched) and directory-only evidence
              (the supplier&apos;s official site unreachable on repeated attempts).
              A supplier with no first-party existence evidence cannot publish —
              there is no &ldquo;pending&rdquo; badge that ships.
            </p>
          </section>

          {/* Taxonomy / [C] backlog */}
          <section aria-labelledby="taxonomy" className="mt-12">
            <h2 id="taxonomy" className="text-2xl font-semibold tracking-tight">
              The ingredient taxonomy and its backlog
            </h2>
            <p
              data-testid="taxonomy-summary"
              className="mt-4 text-sm leading-relaxed text-muted-foreground"
            >
              Browse surfaces use a {stats.categoryCount}-category ingredient
              taxonomy tracking {stats.subtypeCount} subtype entries. A subtype
              becomes a storefront filter only when a supplier page has verified
              it — {stats.verifiedSubtypeCount} entries qualify today;{" "}
              {stats.pendingSubtypeCount} remain pending and are excluded from
              filters until supplier-page verification. {taxonomyData.enumerationNote}
            </p>
          </section>

          {/* Coverage gaps */}
          <section aria-labelledby="gaps" className="mt-12">
            <h2 id="gaps" className="text-2xl font-semibold tracking-tight">
              Known coverage gaps
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The corpus is strong on botanicals, nutraceuticals, and sweeteners;
              it is thin in specific places the specification names:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                MCT oil coverage in Southeast Asia is a gap — the dossier could not
                find vendor-neutral manufacturer deep dives and leaned on
                distributor pages.
              </li>
              <li>
                Bulk vanilla is shallow: sourcing economics (Madagascar cyclone
                pricing, bean-to-tonne economics) are complex, and the corpus lacks
                current-tier pricing evidence.
              </li>
              <li>
                Palm fats and RSPO: segregated-supply and MPOB pricing transparency
                remain open questions.
              </li>
              <li>
                The China dossier needed repeat regulatory checks — categories
                anchored to a single supplier are more fragile than their neighbor
                regions.
              </li>
            </ul>
            {coverageGaps.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Recorded per region
                </h3>
                <ul data-testid="region-gaps" className="mt-3 space-y-3 text-sm">
                  {coverageGaps.map((regionGaps) => (
                    <li key={regionGaps.region}>
                      <span className="font-medium">{regionGaps.region}</span>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                        {regionGaps.gaps.map((gap) => (
                          <li key={gap}>{gap}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              The full source inventory — every platform, registry, and price
              series we may cite, with its access status — is Appendix A of the
              provenance rulebook. Any source not yet inventoried is
              verify-on-use: no source enters the catalog by reputation.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Aekovera. All rights reserved.</p>
          <Link href="/" className="hover:underline">
            Back to the catalog
          </Link>
        </div>
      </footer>
    </div>
  );
}
