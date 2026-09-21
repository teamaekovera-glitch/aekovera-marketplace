"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SupplierCard } from "@/components/catalog/supplier-card";
import { FacetSidebar } from "@/components/catalog/facet-sidebar";
import {
  filterSuppliersByFacets,
  type BrowseFacetGroup,
} from "@/lib/taxonomy";
import type { Supplier } from "@/lib/catalog/types";

/**
 * Client-side browse surface for one taxonomy category. The parent page hands
 * down the category's suppliers (already quarantine-gated), verified-only
 * facet groups, and the pending-subtype count; this component owns selection
 * state and renders the honest empty/filtered states.
 */
export function CategoryBrowser({
  suppliers,
  facetGroups,
  regionLabels,
  pendingSubtypeCount,
}: {
  suppliers: readonly Supplier[];
  facetGroups: readonly BrowseFacetGroup[];
  /** Region display name -> regionId, for facet value translation. */
  regionLabels?: ReadonlyMap<string, string>;
  /** [C] subtypes in this category, excluded from filters until verified. */
  pendingSubtypeCount: number;
}) {
  const [selected, setSelected] = useState<Record<string, ReadonlySet<string>>>({});

  const filtered = useMemo(
    () => filterSuppliersByFacets(suppliers, selected, regionLabels),
    [suppliers, selected, regionLabels],
  );

  function toggle(groupKey: string, value: string) {
    setSelected((previous) => {
      const next = new Set(previous[groupKey] ?? []);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return { ...previous, [groupKey]: next };
    });
  }

  if (suppliers.length === 0) {
    return (
      <div
        data-slot="category-empty"
        data-testid="category-empty-state"
        className="rounded-lg border bg-card p-8 text-center"
      >
        <p className="font-medium">No suppliers listed in this category yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Research is ongoing. Categories appear as supplier-page verification
          completes — see the methodology for how rows are added.
        </p>
        <Link href="/provenance" className="mt-4 inline-block text-sm font-medium underline">
          Read the methodology
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]" data-slot="category-browser">
      <aside>
        <FacetSidebar groups={facetGroups} selected={selected} onToggle={toggle} />
        {pendingSubtypeCount > 0 ? (
          <p
            data-testid="pending-subtypes-note"
            className="mt-4 rounded-lg border bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground"
          >
            {pendingSubtypeCount} subtype{pendingSubtypeCount === 1 ? "" : "s"} in this
            category are pending supplier-page verification and are not yet filterable.
          </p>
        ) : null}
      </aside>

      <section aria-live="polite">
        <p data-testid="result-count" className="text-sm text-muted-foreground">
          Showing {filtered.length} of {suppliers.length} suppliers
        </p>
        {filtered.length === 0 ? (
          <div
            data-testid="filter-empty-state"
            className="mt-4 rounded-lg border bg-card p-8 text-center"
          >
            <p className="font-medium">No suppliers match the selected filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try removing a filter — counts shown on each option are live.
            </p>
            <button
              type="button"
              onClick={() => setSelected({})}
              className="mt-4 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((supplier) => (
              <li key={supplier.id} className="list-none">
                <SupplierCard supplier={supplier} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
