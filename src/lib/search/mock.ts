import type {
  BrandSearchRecord,
  ProductSearchRecord,
  SearchAdapter,
  SearchFilters,
  SearchHit,
} from "./types";

/**
 * In-memory mock search adapter (F-07) — active when Algolia keys are absent.
 * Uses the seeded demo records so search works end-to-end in mock mode.
 */

export class MockSearchAdapter implements SearchAdapter {
  readonly mode = "mock" as const;

  private brands = new Map<string, BrandSearchRecord>();
  private products = new Map<string, ProductSearchRecord>();

  async searchBrands(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<BrandSearchRecord>[]> {
    const q = query.trim().toLowerCase();
    const hits = [...this.brands.values()]
      .filter((b) => matchesQuery(q, [b.name, b.tagline, b.description]))
      .filter((b) => passesFacets(filters, b.categories, b.subcategories, b.certifications, b.distributionRegions))
      .filter((b) => filters.isVerified === undefined || b.isVerified === filters.isVerified)
      // Plan visibility ordering: priority > boosted > standard > low.
      .sort(byVisibility);
    return hits.map((record, i) => ({ record, position: i }));
  }

  async searchProducts(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<ProductSearchRecord>[]> {
    const q = query.trim().toLowerCase();
    const hits = [...this.products.values()]
      .filter((p) => p.status === "published")
      .filter((p) =>
        matchesQuery(q, [p.name, p.description, p.brandName, p.category, p.subcategory]),
      )
      .filter((p) =>
        passesFacets(
          filters,
          p.category ? [p.category] : [],
          p.subcategory ? [p.subcategory] : [],
          p.certifications,
          [],
        ),
      );
    return hits.map((record, i) => ({ record, position: i }));
  }

  async indexBrand(record: BrandSearchRecord): Promise<void> {
    this.brands.set(record.brandId, record);
  }

  async indexProduct(record: ProductSearchRecord): Promise<void> {
    this.products.set(record.productId, record);
  }

  async removeBrand(brandId: string): Promise<void> {
    this.brands.delete(brandId);
  }

  async removeProduct(productId: string): Promise<void> {
    this.products.delete(productId);
  }
}

function matchesQuery(q: string, fields: Array<string | null>): boolean {
  if (!q) return true;
  return fields.some((f) => (f ?? "").toLowerCase().includes(q));
}

type FacetFilter = (
  facets: SearchFilters,
  categories: string[],
  subcategories: string[],
  certifications: string[],
  regions: string[],
) => boolean;

const passesFacets: FacetFilter = (
  filters,
  categories,
  subcategories,
  certifications,
  regions,
) => {
  const intersects = (wanted: string[] | undefined, have: string[]) =>
    !wanted?.length || wanted.some((w) => have.includes(w));
  return (
    intersects(filters.categories, categories) &&
    intersects(filters.subcategories, subcategories) &&
    intersects(filters.certifications, certifications) &&
    intersects(filters.distributionRegions, regions)
  );
};

const VISIBILITY_RANK: Record<string, number> = {
  priority: 4,
  boosted: 3,
  standard: 2,
  low: 1,
};

function byVisibility(
  a: { searchVisibility: string },
  b: { searchVisibility: string },
): number {
  return (VISIBILITY_RANK[b.searchVisibility] ?? 0) - (VISIBILITY_RANK[a.searchVisibility] ?? 0);
}
