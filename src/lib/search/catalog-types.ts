/**
 * Catalog search types for marketplace v1 (buyer-facing supplier search).
 *
 * The client interface mirrors the F-07 SearchAdapter scaffold in this
 * directory (`types.ts`: mode discriminator, async search returning
 * `SearchHit`-shaped results) so a hosted-engine implementation (Algolia) can
 * replace the local client later without UI changes.
 *
 * The v1 engine is a local, deterministic inverted index over the build-time
 * merged catalog (`src/lib/catalog/merge.ts`): pure functions, zero network
 * calls, zero API keys — identical results in CI and production.
 */

import type { PriceTier } from "../catalog/types";

/**
 * Flat, search-ready view of one supplier row. Provenance stays in the
 * underlying `Supplier` record; the index carries display values only.
 */
export interface CatalogSupplierRecord {
  /** Unique object id — the supplier id (stable sort key). */
  objectID: string;
  supplierId: string;
  name: string;
  /** Dataset display name (e.g. "Southeast Asia"). */
  region: string;
  country: string | null;
  /** Top-level category strings, verbatim from the row. */
  categories: string[];
  /**
   * Subtype-level ingredient entries, verbatim from the row. Supplier rows
   * have no separate subtype field: each entry ("robusta green coffee") is
   * the subtype-level item under a category ("coffee"), so this list is both
   * the indexed "ingredients" field and the "subtype" facet source.
   */
  ingredients: string[];
  /** Certification names, verbatim (company-stated; never normalized). */
  certifications: string[];
  /** Form vocabulary extracted from ingredient text, where sourced. */
  forms: string[];
  /** Verbatim MOQ string, or null (Unknown — Rulebook D4). */
  moq: string | null;
  /** Banded MOQ for faceting (parsed where the string carries quantities). */
  moqBand: MoqBand;
  /** Distinct price tiers the row carries ("quote-only" is a tier, not an absence). */
  priceTiers: PriceTier[];
  website: string | null;
  type: string | null;
  verificationLevel: string;
  confidence: string;
}

/**
 * MOQ bands facet (parsed from verbatim strings; smallest stated quantity
 * wins). "unspecified" covers null MOQs and strings without parseable
 * quantity+unit pairs — never inferred.
 */
export type MoqBand = "<=25 kg" | "26-100 kg" | "101-1,000 kg" | ">1,000 kg" | "unspecified";

export interface CatalogSearchFilters {
  regions?: string[];
  countries?: string[];
  categories?: string[];
  subtypes?: string[];
  forms?: string[];
  certifications?: string[];
  moqBands?: string[];
  /** Price-signal presence, by tier: supplier-published | marketplace-listed | quote-only. */
  priceTiers?: PriceTier[];
}

export interface FacetCount {
  value: string;
  count: number;
}

/** Counts per facet over the query-matched set, sorted count desc then value asc. */
export interface CatalogFacetCounts {
  region: FacetCount[];
  category: FacetCount[];
  subtype: FacetCount[];
  form: FacetCount[];
  certification: FacetCount[];
  moqBand: FacetCount[];
  priceTiers: FacetCount[];
}

export interface CatalogSearchHit {
  record: CatalogSupplierRecord;
  /** 0-based placement — mirrors the F-07 SearchHit shape. */
  position: number;
  score: number;
  /** Query tokens matched by this record (sorted). */
  matchedTerms: string[];
}

export interface CatalogSearchResponse {
  query: string;
  hits: CatalogSearchHit[];
  facetCounts: CatalogFacetCounts;
  totalHits: number;
}

/**
 * Catalog search client (shaped like the F-07 `SearchAdapter` scaffold:
 * mode discriminator + async search). Swapping the local index for Algolia
 * later is an implementation change only — call sites hold this interface.
 */
export interface CatalogSearchClient {
  readonly mode: "local" | "algolia";
  searchCatalog(query: string, filters?: CatalogSearchFilters): Promise<CatalogSearchResponse>;
}
