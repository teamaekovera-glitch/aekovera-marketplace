/**
 * Typed search adapter interface (F-07).
 *
 * Index definitions mirror docs/specs/02_ARCHITECTURE.md §6 (brand + product
 * searchable attributes and facets). Implementations: mock (in-memory) and
 * Algolia.
 */

export interface BrandSearchRecord {
  objectID: string;
  brandId: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  categories: string[];
  subcategories: string[];
  certifications: string[];
  distributionRegions: string[];
  moq: string | null;
  profileTier: string;
  searchVisibility: string;
  isVerified: boolean;
}

export interface ProductSearchRecord {
  objectID: string;
  productId: string;
  brandId: string;
  brandName: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  certifications: string[];
  status: string;
}

export interface SearchFilters {
  categories?: string[];
  subcategories?: string[];
  certifications?: string[];
  distributionRegions?: string[];
  isVerified?: boolean;
}

export interface SearchHit<T> {
  record: T;
  /** Higher = more prominent placement for the record. */
  position: number;
}

export interface SearchAdapter {
  readonly mode: "algolia" | "mock";

  searchBrands(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<BrandSearchRecord>[]>;
  searchProducts(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchHit<ProductSearchRecord>[]>;
  /** Push a brand into the index; called from profile save hooks. */
  indexBrand(record: BrandSearchRecord): Promise<void>;
  /** Push a product into the index; called from product save hooks. */
  indexProduct(record: ProductSearchRecord): Promise<void>;
  removeBrand(brandId: string): Promise<void>;
  removeProduct(productId: string): Promise<void>;
}
