import { env, serviceMode } from "../env";
import { AlgoliaSearchAdapter } from "./algolia";
import { MockSearchAdapter } from "./mock";
import type { SearchAdapter } from "./types";

/**
 * Search adapter factory (F-07): Algolia when keys exist, otherwise the
 * in-memory mock — mock-first doctrine.
 */
export function createSearchAdapter(): SearchAdapter {
  return serviceMode.search === "algolia"
    ? new AlgoliaSearchAdapter(
        env.algoliaAppId,
        env.algoliaAdminKey,
        env.algoliaBrandsIndex,
        env.algoliaProductsIndex,
      )
    : new MockSearchAdapter();
}

export { BRANDS_INDEX_SETTINGS, PRODUCTS_INDEX_SETTINGS } from "./algolia";
export type {
  BrandSearchRecord,
  ProductSearchRecord,
  SearchAdapter,
  SearchFilters,
  SearchHit,
} from "./types";
