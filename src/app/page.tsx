import Link from "next/link";
import type { Metadata } from "next";

import { SearchEntryForm } from "@/components/browse/search-entry-form";
import { StatStrip } from "@/components/catalog/stat-strip";
import { buttonVariants } from "@/components/ui/button";
import { quarantinedCount } from "@/lib/catalog/display";
import { catalogSuppliers, regionCounts, regionalDatasets } from "@/lib/catalog/merge";
import { categoryEntries, regionEntries, taxonomyStats } from "@/lib/taxonomy";

/**
 * Landing page for Ingredient Marketplace v1 (spec F-01): search-first entry,
 * live counts computed from the dataset at build time — never hardcoded —
 * and region/category entry points. The suppliers headline counts the full
 * research corpus (spec route row: "254 suppliers · 33 categories · 6
 * regions"); quarantined rows are never counted among listed suppliers, and
 * the listed/withheld split is disclosed explicitly below the strip.
 */

export const metadata: Metadata = {
  title: "Ingredient suppliers, in one place",
  description:
    "A provenance-first catalog of ingredient suppliers across six regions. Every claim links to the page it was read from, with the date we read it and a confidence rating.",
};

export default function LandingPage() {
  const allRows = regionalDatasets.flatMap((dataset) => dataset.suppliers);
  const withheldRows = quarantinedCount(allRows);
  const stats = taxonomyStats();
  const regions = regionEntries(catalogSuppliers, regionCounts);
  const categories = categoryEntries(catalogSuppliers);

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
            <Link href="/provenance" className="text-muted-foreground hover:text-foreground">
              Provenance
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Search-first hero */}
        <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Ingredient suppliers, in one place
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                A provenance-first catalog of {allRows.length} suppliers across{" "}
                {regionCounts.length} regions. Every claim links to the page it was read
                from, with the date we read it and a confidence rating — nothing is
                presented as verified until a registry says so.
              </p>
              <div className="mt-8">
                <SearchEntryForm />
              </div>
            </div>
          </div>
        </section>

        {/* Live catalog stats — computed from the dataset at build time */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <StatStrip
            stats={[
              { value: allRows.length, label: "Suppliers researched" },
              { value: regionCounts.length, label: "Regions" },
              { value: stats.categoryCount, label: "Ingredient categories" },
              { value: stats.subtypeCount, label: "Taxonomy subtypes tracked" },
            ]}
          />
          <p data-testid="withheld-note" className="mt-3 text-xs text-muted-foreground">
            Counts are computed from the research corpus at build time.{" "}
            {catalogSuppliers.length} suppliers are listed.
            {withheldRows > 0
              ? ` ${withheldRows} supplier rows are withheld pending verification and are not listed or searchable.`
              : ""}
          </p>
        </section>

        {/* Region entry points */}
        <section className="border-t bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Browse by region</h2>
            <p className="mt-2 text-muted-foreground">
              Research dossiers were built region by region; each link opens the
              discovery surface filtered to that region.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((region) => (
                <li key={region.regionId}>
                  <Link
                    href={`/suppliers?region=${region.regionId}`}
                    data-slot="region-entry"
                    className="flex h-full flex-col justify-between rounded-lg border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/60"
                  >
                    <span className="font-semibold">{region.region}</span>
                    <span className="mt-2 text-sm text-muted-foreground">
                      {region.supplierCount} suppliers listed
                      {region.withheldCount > 0
                        ? ` · ${region.withheldCount} withheld pending verification`
                        : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Category entry points */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Browse by ingredient category
          </h2>
          <p className="mt-2 text-muted-foreground">
            {stats.categoryCount} categories from our ingredient taxonomy, each with
            live supplier counts. Subtypes appear as filters only once a supplier
            page has verified them.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  data-slot="category-entry"
                  className="flex items-baseline justify-between gap-2 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm transition-colors hover:bg-secondary/60"
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {category.supplierCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Provenance strip */}
        <section className="border-t bg-secondary/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight">
                Every fact carries its evidence
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Claims are recorded with the exact URL they were read from and the
                date we read it. Certifications are shown as company-stated until a
                registry verifies them. Unknown fields say so, in plain language.
              </p>
            </div>
            <Link href="/provenance" className={buttonVariants({ variant: "outline" })}>
              Read the methodology
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Aekovera. All rights reserved.</p>
          <p>Provenance-first ingredient sourcing · v1</p>
        </div>
      </footer>
    </div>
  );
}
