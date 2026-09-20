/**
 * Local catalog search client — the v1 engine over the build-time merged
 * catalog. Shaped like the F-07 SearchAdapter scaffold so a hosted engine
 * (Algolia) can slot in later without UI changes: call sites hold
 * `CatalogSearchClient` and only ever see this interface.
 */

import { catalogDataset } from "../catalog/merge";
import {
  buildCatalogIndex,
  buildCatalogRecords,
  searchCatalogIndex,
} from "./catalog-index";
import type { CatalogIndex } from "./catalog-index";
import type { RegionCount } from "../catalog/types";
import type {
  CatalogSearchClient,
  CatalogSearchFilters,
  CatalogSearchResponse,
  CatalogSupplierRecord,
} from "./catalog-types";

export class LocalCatalogSearchClient implements CatalogSearchClient {
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
 * Client over the merged dataset (src/lib/catalog build-time merge) — pure,
 * deterministic, no network, no keys: identical results in CI and prod.
 */
export function createCatalogSearchClient(): CatalogSearchClient {
  return new LocalCatalogSearchClient(
    buildCatalogRecords(catalogDataset),
    catalogDataset.regionCounts,
  );
}
