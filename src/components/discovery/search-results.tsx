import Link from "next/link";
import { SupplierCard } from "@/components/catalog";
import type { CatalogSearchHit } from "@/lib/search/catalog-types";
import type { Supplier } from "@/lib/catalog/types";

/** Result cap: browse stays renderable; the note states the total honestly. */
export const RESULTS_CAP = 48;

/** A result: the searched record joined back to its full provenance row. */
export interface SearchResultItem {
  supplier: Supplier;
  hit: CatalogSearchHit;
}

/**
 * The discovery result list: count line, result cards with profile links,
 * an explicit truncation note, and an explained empty state. The parent
 * owns query/filter state; this renders the response.
 */
export function SearchResults({
  items,
  totalHits,
  query,
  compareIds,
  onToggleCompare,
  onClearFilters,
}: {
  items: readonly SearchResultItem[];
  totalHits: number;
  query: string;
  compareIds: ReadonlySet<string>;
  onToggleCompare: (id: string) => void;
  onClearFilters: () => void;
}) {
  if (totalHits === 0) {
    return (
      <div
        data-slot="search-empty"
        className="rounded-lg border bg-card p-8 text-center"
      >
        <h2 className="text-base font-semibold">No suppliers match your search.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {query.trim().length > 0 ? (
            <>
              No indexed field — name, ingredient, category, or certification —
              matches{" "}
              <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>.
              Results require at least one matching term.
            </>
          ) : (
            "No supplier passes the selected filters. Every search field is sourced; nothing is inferred to fill a result set."
          )}
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-sm font-medium text-accent underline underline-offset-2 hover:opacity-80"
        >
          Clear search and filters
        </button>
      </div>
    );
  }

  const shown = items.slice(0, RESULTS_CAP);
  const truncated = totalHits > shown.length;

  return (
    <div data-slot="search-results" className="flex flex-col gap-4">
      <p data-result-count className="text-sm text-muted-foreground">
        {totalHits.toLocaleString("en-US")}{" "}
        {totalHits === 1 ? "supplier" : "suppliers"}
        {query.trim() ? (
          <>
            {" "}
            for <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>
          </>
        ) : null}
      </p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-result-list>
        {shown.map(({ supplier }) => (
          <li key={supplier.id} className="flex min-w-0 flex-col gap-2">
            <SupplierCard
              supplier={supplier}
              compareSelected={compareIds.has(supplier.id)}
              onToggleCompare={onToggleCompare}
            />
            <p className="text-right text-sm">
              <Link
                href={`/suppliers/${supplier.id}`}
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                View full profile →
              </Link>
            </p>
          </li>
        ))}
      </ul>

      {truncated ? (
        <p data-truncated-note className="text-sm text-muted-foreground">
          Showing the first {shown.length} of {totalHits.toLocaleString("en-US")}{" "}
          results — refine your search or filters to narrow the set. Nothing is
          hidden by ranking; the count above is the full matched set.
        </p>
      ) : null}
    </div>
  );
}
