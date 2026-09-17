import { algoliasearch } from "algoliasearch";
import type {
  BrandSearchRecord,
  ProductSearchRecord,
  SearchAdapter,
  SearchFilters,
  SearchHit,
} from "./types";

/**
 * Algolia search adapter (F-07) — active when ALGOLIA_APP_ID and
 * ALGOLIA_ADMIN_API_KEY are present. Index settings follow the architecture
 * spec §6; facet ordering in results mirrors plan-based visibility.
 */

export const BRANDS_INDEX_SETTINGS = {
  searchableAttributes: [
    "name",
    "tagline",
    "description",
    "categories",
    "subcategories",
    "certifications",
  ],
  attributesForFaceting: [
    "filterOnly(categories)",
    "filterOnly(subcategories)",
    "filterOnly(certifications)",
    "filterOnly(distributionRegions)",
    "filterOnly(isVerified)",
  ],
  customRanking: ["desc(searchVisibilityRank)", "desc(isVerified)"],
};

export const PRODUCTS_INDEX_SETTINGS = {
  searchableAttributes: ["name", "description", "brandName", "category", "subcategory"],
  attributesForFaceting: [
    "filterOnly(category)",
    "filterOnly(subcategory)",
    "filterOnly(certifications)",
  ],
  customRanking: ["desc(createdAt)"],
};

function visibilityRank(visibility: string): number {
  return { priority: 4, boosted: 3, standard: 2, low: 1 }[visibility] ?? 0;
}

export class AlgoliaSearchAdapter implements SearchAdapter {
  readonly mode = "algolia" as const;

  private client: ReturnType<typeof algoliasearch>;
  private brandsIndex: string;
  private productsIndex: string;

  constructor(appId: string, adminKey: string, brandsIndex: string, productsIndex: string) {
    this.client = algoliasearch(appId, adminKey);
    this.brandsIndex = brandsIndex;
    this.productsIndex = productsIndex;
  }

  async searchBrands(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<BrandSearchRecord>[]> {
    const { hits: hitList } = await this.client.searchSingleIndex<BrandSearchRecord>({
      indexName: this.brandsIndex,
      searchParams: {
        query,
        facetFilters: toAlgoliaFacetFilters(filters),
        hitsPerPage: 24,
      },
    });
    return hitList.map((hit, i) => ({
      record: hit,
      position: i,
    }));
  }

  async searchProducts(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<ProductSearchRecord>[]> {
    const { hits: hitList } = await this.client.searchSingleIndex<ProductSearchRecord>({
      indexName: this.productsIndex,
      searchParams: {
        query,
        facetFilters: toAlgoliaFacetFilters(filters),
        hitsPerPage: 48,
      },
    });
    return hitList.map((hit, i) => ({
      record: hit,
      position: i,
    }));
  }

  async indexBrand(record: BrandSearchRecord): Promise<void> {
    await this.client.saveObject({
      indexName: this.brandsIndex,
      body: {
        ...record,
        searchVisibilityRank: visibilityRank(record.searchVisibility),
      },
    });
  }

  async indexProduct(record: ProductSearchRecord): Promise<void> {
    await this.client.saveObject({ indexName: this.productsIndex, body: record });
  }

  async removeBrand(brandId: string): Promise<void> {
    await this.client.deleteObject({ indexName: this.brandsIndex, objectID: brandId });
  }

  async removeProduct(productId: string): Promise<void> {
    await this.client.deleteObject({ indexName: this.productsIndex, objectID: productId });
  }
}

function toAlgoliaFacetFilters(filters: SearchFilters): string[][] {
  const groups: string[][] = [];
  const push = (facet: string, values: string[] | undefined) => {
    if (values?.length) {
      groups.push(values.map((v) => `${facet}:${v}`));
    }
  };
  push("categories", filters.categories);
  push("subcategories", filters.subcategories);
  push("certifications", filters.certifications);
  push("distributionRegions", filters.distributionRegions);
  if (filters.isVerified !== undefined) {
    groups.push([`isVerified:${filters.isVerified}`]);
  }
  return groups;
}
