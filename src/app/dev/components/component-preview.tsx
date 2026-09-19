"use client";

import { useMemo, useState } from "react";
import {
  CategoryNav,
  CompareTray,
  EvidenceDrawer,
  FacetSidebar,
  ProvenanceBadge,
  SearchBar,
  StatStrip,
  SupplierCard,
  UnknownField,
} from "@/components/catalog";
import {
  facetCounts,
  MAX_COMPARE,
  quarantinedCount,
  visibleSuppliers,
} from "@/lib/catalog/display";
import type { RegionCount, Supplier } from "@/lib/catalog/types";

/** Interactive preview of the presentational catalog components (dev-only). */
export function ComponentPreview({
  suppliers,
  regionCounts,
  totalCount,
  edgeSuppliers,
}: {
  suppliers: Supplier[];
  regionCounts: RegionCount[];
  totalCount: number;
  edgeSuppliers: Supplier[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFacets, setSelectedFacets] = useState<
    Record<string, Set<string>>
  >({});
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const categoryFacets = useMemo(
    () => facetCounts(suppliers, "categories"),
    [suppliers]
  );
  const ingredientFacets = useMemo(
    () => facetCounts(suppliers, "ingredients"),
    [suppliers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const facetSelections = [
      ...(selectedFacets.categories ?? new Set<string>()),
      ...(selectedFacets.ingredients ?? new Set<string>()),
    ];
    return visibleSuppliers(suppliers).filter((supplier) => {
      const matchesQuery =
        q.length === 0 ||
        supplier.name.value.toLowerCase().includes(q) ||
        supplier.country.value.toLowerCase().includes(q) ||
        supplier.ingredients.value.some((i) => i.toLowerCase().includes(q)) ||
        supplier.categories.value.some((c) => c.toLowerCase().includes(q));
      const matchesCategory =
        !selectedCategory ||
        supplier.categories.value.includes(selectedCategory);
      const claimValues = [
        ...supplier.categories.value,
        ...supplier.ingredients.value,
      ];
      const matchesFacets =
        facetSelections.length === 0 ||
        facetSelections.every((s) => claimValues.includes(s));
      return matchesQuery && matchesCategory && matchesFacets;
    });
  }, [suppliers, query, selectedCategory, selectedFacets]);

  const shown = filtered.slice(0, 8);
  const compare = compareIds
    .map((id) => suppliers.find((s) => s.id === id))
    .filter((s): s is Supplier => Boolean(s));

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].slice(0, MAX_COMPARE)
    );

  const toggleFacet = (groupKey: string, value: string) =>
    setSelectedFacets((prev) => {
      const set = new Set(prev[groupKey] ?? []);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return { ...prev, [groupKey]: set };
    });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Catalog components — preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dev-only surface (no Storybook): every presentational component,
          against the merged Southeast Asia dataset plus mock fixtures. All
          facts link to their claim-level source, or render the Unknown label.
        </p>
      </header>

      <section className="mb-8">
        <SectionTitle>StatStrip</SectionTitle>
        <StatStrip
          stats={[
            { label: "Suppliers", value: totalCount },
            {
              label: "Regions",
              value: regionCounts.length,
            },
            { label: "Categories", value: categoryFacets.length },
            { label: "Ingredients", value: ingredientFacets.length },
            {
              label: "Withheld rows",
              value: quarantinedCount([...suppliers, ...edgeSuppliers]),
            },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-8">
          <section>
            <SectionTitle>CategoryNav</SectionTitle>
            <CategoryNav
              categories={categoryFacets.map((f) => ({
                value: f.value,
                count: f.count,
              }))}
              selected={selectedCategory}
              onSelect={(value) =>
                setSelectedCategory((prev) => (prev === value ? null : value))
              }
            />
          </section>
          <section>
            <SectionTitle>FacetSidebar</SectionTitle>
            <FacetSidebar
              groups={[
                {
                  key: "categories",
                  label: "Categories",
                  options: categoryFacets,
                },
                {
                  key: "ingredients",
                  label: "Ingredients",
                  options: ingredientFacets,
                },
              ]}
              selected={selectedFacets}
              onToggle={toggleFacet}
            />
          </section>
          <section>
            <SectionTitle>Edge cases</SectionTitle>
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                UnknownField
              </p>
              <UnknownField />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ProvenanceBadge (Unverified row)
              </p>
              <ProvenanceBadge
                supplier={{
                  verificationLevel: "Unverified",
                  confidence: "Low",
                }}
              />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                EvidenceDrawer (no claims)
              </p>
              <EvidenceDrawer claims={[]} />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full cards: fully-sourced row, row with Unknowns, quarantined row
              </p>
              {edgeSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          </section>
        </aside>

        <div className="flex flex-col gap-6">
          <section>
            <SectionTitle>SearchBar</SectionTitle>
            <SearchBar value={query} onChange={setQuery} />
          </section>

          <section>
            <SectionTitle>CompareTray</SectionTitle>
            <CompareTray suppliers={compare} onRemove={toggleCompare} />
          </section>

          <section>
            <SectionTitle>
              SupplierCard grid{" "}
              <span className="font-normal text-muted-foreground">
                ({shown.length} of {filtered.length} visible rows)
              </span>
            </SectionTitle>
            {filtered.length === 0 ? (
              <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                No suppliers match your search or filters. Clear a filter to
                widen the results.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {shown.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    compareSelected={compareIds.includes(supplier.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}
