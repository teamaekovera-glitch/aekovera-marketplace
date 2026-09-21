import {
  buildCatalogIndex,
  buildCatalogRecords,
  searchCatalogIndex,
} from "@/lib/search/catalog-index";
import type { CatalogIndex } from "@/lib/search/catalog-index";
import type { RegionCount, Supplier } from "@/lib/catalog/types";
import type {
  CatalogSearchClient,
  CatalogSearchFilters,
  CatalogSearchResponse,
  CatalogSupplierRecord,
} from "@/lib/search/catalog-types";

/**
 * Client-safe search for the discovery surface.
 *
 * The catalog's canonical local client (`LocalCatalogSearchClient`) builds
 * its index from the merged dataset module — importing that into a client
 * component would pull every regional JSON file into the browser bundle.
 * This wrapper composes the same published index functions over records
 * handed to it instead: the /suppliers server page passes the visible
 * suppliers and dataset-level region counts through the server/client
 * boundary, so the data crosses once, through an explicit visibility gate.
 *
 * It implements the same `CatalogSearchClient` interface, so the discovery
 * UI keeps the Algolia swap path without UI changes.
 */
export class DiscoverySearchClient implements CatalogSearchClient {
  readonly mode = "local" as const;

  private readonly index: CatalogIndex;

  constructor(
    records: readonly CatalogSupplierRecord[],
    regionCounts?: readonly RegionCount[],
  ) {
    this.index = buildCatalogIndex(records, regionCounts);
  }

  async searchCatalog(
    query: string,
    filters: CatalogSearchFilters = {},
  ): Promise<CatalogSearchResponse> {
    return searchCatalogIndex(this.index, query, filters);
  }
}

/**
 * Search records for the discovery surface, built from the suppliers the
 * server page passed across the boundary (already the visible subset).
 * Region counts stay dataset-level per the merge contract: region facets
 * report catalog truth, not the searchable subset.
 */
export function buildDiscoveryRecords(
  suppliers: readonly Supplier[],
  regionCounts: readonly RegionCount[],
): CatalogSupplierRecord[] {
  return buildCatalogRecords({
    suppliers: [...suppliers],
    regionCounts: [...regionCounts],
    totalCount: suppliers.length,
  });
}
