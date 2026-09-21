import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryBrowser } from "@/components/browse/category-browser";
import { CategoryLinks } from "@/components/browse/category-links";
import { catalogSuppliers, regionCounts } from "@/lib/catalog/merge";
import {
  categoryEntries,
  regionFacetOptions,
  regionIdByName,
  subtypeFacetOptions,
  suppliersInCategory,
  taxonomyCategories,
  taxonomyCategoryBySlug,
  REGION_FACET_KEY,
  SUBTYPE_FACET_KEY,
  type BrowseFacetGroup,
} from "@/lib/taxonomy";

/**
 * Category browse surface (spec F-02): one page per taxonomy category, static
 * at build time, with verified-only subtype facets and live supplier counts.
 * [C] subtypes are excluded from filters until supplier-page verification —
 * the pending count is disclosed instead.
 */

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return taxonomyCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = taxonomyCategoryBySlug(slug);
  if (!category) {
    return { title: "Category not found" };
  }
  return {
    title: `${category.name} suppliers`,
    description: `Ingredient suppliers in ${category.name}, with claim-level provenance for every fact.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = taxonomyCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const suppliers = suppliersInCategory(catalogSuppliers, category);
  const pendingSubtypeCount = category.subtypes.filter((subtype) => !subtype.verified).length;

  const facetGroups: BrowseFacetGroup[] = [
    {
      key: SUBTYPE_FACET_KEY,
      label: "Ingredient subtypes (verified)",
      options: subtypeFacetOptions(catalogSuppliers, category),
    },
    {
      key: REGION_FACET_KEY,
      label: "Region",
      options: regionFacetOptions(suppliers, regionCounts),
    },
  ];

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
        <section className="border-b bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <p className="text-sm text-muted-foreground">
              <Link href="/" className="hover:underline">
                Ingredient Marketplace
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{category.name}</span>
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {category.name}
            </h1>
            <p data-testid="category-summary" className="mt-3 text-sm text-muted-foreground">
              {suppliers.length} suppliers listed · {category.subtypes.length} subtypes
              tracked · {pendingSubtypeCount} pending supplier-page verification
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <CategoryBrowser
            suppliers={suppliers}
            facetGroups={facetGroups}
            regionLabels={regionIdByName(regionCounts)}
            pendingSubtypeCount={pendingSubtypeCount}
          />
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All ingredient categories
            </h2>
            <CategoryLinks
              entries={categoryEntries(catalogSuppliers)}
              activeSlug={category.slug}
              className="mt-4"
            />
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Aekovera. All rights reserved.</p>
          <Link href="/provenance" className="hover:underline">
            How we verify
          </Link>
        </div>
      </footer>
    </div>
  );
}
