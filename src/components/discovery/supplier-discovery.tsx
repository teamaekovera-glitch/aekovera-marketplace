"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CompareTray, FacetSidebar, SearchBar } from "@/components/catalog";
import type { FacetGroup } from "@/components/catalog/facet-sidebar";
import { MAX_COMPARE } from "@/lib/catalog/display";
import type { RegionCount, Supplier } from "@/lib/catalog/types";
import type { CatalogSearchResponse } from "@/lib/search/catalog-types";
import { buildDiscoveryRecords, DiscoverySearchClient } from "./search-client";
import { SearchResults, type SearchResultItem } from "./search-results";
import {
  buildFacetGroups,
  toSearchFilters,
  withheldRowCount,
} from "./filters";

/**
 * The /suppliers discovery surface: keyword search over the real build-time
 * index, taxonomy facets (OR within a group, AND across groups), result
 * cards, and the compare tray. The server page owns the visibility gate —
 * this component only ever receives visible suppliers.
 */
export function SupplierDiscovery({
  suppliers,
  regionCounts,
  initialResponse,
}: {
  suppliers: readonly Supplier[];
  regionCounts: readonly RegionCount[];
  /** The browse-mode response the server page already computed — no client flash. */
  initialResponse: CatalogSearchResponse;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [response, setResponse] = useState(initialResponse);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const client = useMemo(
    () =>
      new DiscoverySearchClient(
        buildDiscoveryRecords(suppliers, regionCounts),
        regionCounts,
      ),
    [suppliers, regionCounts],
  );

  useEffect(() => {
    let active = true;
    client
      .searchCatalog(query, toSearchFilters(selected))
      .then((next) => {
        if (active) setResponse(next);
      });
    // Local index resolves synchronously; the active flag guards re-runs.
    return () => {
      active = false;
    };
  }, [client, query, selected]);

  const toggleFacet = (groupKey: string, value: string) =>
    setSelected((prev) => {
      const set = new Set(prev[groupKey] ?? []);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return { ...prev, [groupKey]: set };
    });

  const toggleCompare = (id: string) =>
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((existing) => existing !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });

  const clearAll = () => {
    setQuery("");
    setSelected({});
  };

  const suppliersById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );

  const items: SearchResultItem[] = response.hits.flatMap((hit) => {
    const supplier = suppliersById.get(hit.record.supplierId);
    return supplier ? [{ supplier, hit }] : [];
  });

  const facetGroups: FacetGroup[] = useMemo(
    () => buildFacetGroups(response.facetCounts),
    [response.facetCounts],
  );

  const compareSuppliers = compareIds.flatMap((id) => {
    const supplier = suppliersById.get(id);
    return supplier ? [supplier] : [];
  });

  const withheld = withheldRowCount(suppliers, regionCounts);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Aekovera Marketplace
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Ingredient suppliers
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            A researched catalog across six regions. Every fact links to the
            page it was read from, with the date it was read — anything without
            a source is labeled Unknown, never filled in. Certifications are
            shown exactly as suppliers state them.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside aria-label="Search filters" className="min-w-0">
            <div className="lg:sticky lg:top-6">
              <FacetSidebar
                groups={facetGroups}
                selected={selected}
                onToggle={toggleFacet}
              />
              {withheld > 0 ? (
                <p className="mt-6 text-xs text-muted-foreground" data-withheld-note>
                  Region counts reflect the full research catalog. {withheld}{" "}
                  rows are withheld pending verification and are not searchable.
                </p>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0">
            <SearchResults
              items={items}
              totalHits={response.totalHits}
              query={query}
              compareIds={new Set(compareIds)}
              onToggleCompare={toggleCompare}
              onClearFilters={clearAll}
            />
          </div>
        </div>
      </main>

      {compareSuppliers.length > 0 ? (
        <div
          data-slot="compare-dock"
          className="sticky bottom-0 z-30 border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Compare suppliers</p>
              <Button variant="outline" size="sm" onClick={() => setCompareIds([])}>
                Clear comparison
              </Button>
            </div>
            <CompareTray suppliers={compareSuppliers} onRemove={toggleCompare} />
          </div>
        </div>
      ) : null}

      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        Evidence was read from the linked sources on the dates shown. Withheld
        rows are excluded from this catalog pending verification.
      </footer>
    </div>
  );
}
