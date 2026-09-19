/**
 * Canonical catalog data model for marketplace v1.
 *
 * Provenance is claim-level (Provenance Rulebook art_lD3jEqrv, rule D1): every
 * fact a buyer can act on carries the URL it was read from and the date we read
 * it. A displayed field without provenance is a validation failure, and "we
 * looked and found nothing" is recorded as null (Unknown), never as a blank,
 * zero, or an inferred value (rule D4).
 */

/**
 * Provenance for a single claim (Rulebook D1/D12): the page the claim was read
 * from and the ISO date (YYYY-MM-DD) that page was opened and read.
 */
export interface SourceRef {
  url: string;
  retrievedAt: string;
  /** Why this URL supports the claim, or how it qualifies it (e.g. self-published). */
  note?: string;
}

/** A displayed value paired with its claim-level source. */
export interface SourcedValue<T> {
  value: T;
  source: SourceRef;
}

/**
 * Price tiers (Rulebook B1–B5). A price signal without one of these labels
 * cannot exist in the data model. `quote-only` is the default, honest state.
 */
export type PriceTier = "supplier-published" | "marketplace-listed" | "quote-only";

/**
 * A price signal labeled by tier (Rulebook B1). Tier 1/2 signals carry a
 * verbatim `value` with the unit and currency exactly as the source states it
 * (Rulebook B6); quote-only rows carry none.
 */
export interface PriceSignal {
  tier: PriceTier;
  /** Published figure, verbatim (e.g. "USD 3,350.00/MT, FOB Jakarta"). */
  value?: string;
  /** Staleness qualifier read from the source (Rulebook B8), verbatim. */
  staleness?: string;
  note?: string;
  source: SourceRef;
}

/**
 * v1 records every certification as it appears on the fetched page — never as
 * registry-verified (Rulebook C10/C11). Registry verification is a later,
 * per-certificate upgrade path.
 */
export type CertificationStatus = "company-stated";

export interface Certification {
  name: string;
  status: CertificationStatus;
  source: SourceRef;
}

/**
 * Rows withheld from publication pending verification (spec trust gates).
 * Quarantine is a reason-bearing state, never a silent drop.
 */
export interface Quarantine {
  reason: string;
  note?: string;
}

/** How the row was verified, per the research methodology. */
export type VerificationLevel =
  | "Official-site"
  | "Official-site + association context"
  | "Registry"
  | "Unverified";

/** Evidence confidence for the row (Rulebook D3). */
export type Confidence = "High" | "Medium-High" | "Medium" | "Low";

export interface Supplier {
  /** Stable id: `{regionId prefix}-{original row ordinal, zero-padded}`. */
  id: string;
  regionId: string;
  name: SourcedValue<string>;
  website: SourcedValue<string>;
  /** null = Unknown (no fetched source; Rulebook D4). */
  hq: SourcedValue<string> | null;
  country: SourcedValue<string>;
  regionsServed: SourcedValue<string> | null;
  categories: SourcedValue<string[]>;
  ingredients: SourcedValue<string[]>;
  type: SourcedValue<string> | null;
  /** Empty array = the reviewed page listed none (recorded, not inferred). */
  certifications: SourcedValue<Certification[]>;
  moq: SourcedValue<string> | null;
  samplePolicy: SourcedValue<string> | null;
  /** At least one signal per row — quote-only is a tier, not an absence. */
  priceSignals: PriceSignal[];
  capacity: SourcedValue<string> | null;
  reviewPresence: SourcedValue<string> | null;
  verificationLevel: VerificationLevel;
  confidence: Confidence;
  note?: string;
  quarantined?: Quarantine;
  /** Distinct sources backing this row's claims. */
  sources: SourceRef[];
}

/** Region-level price evidence not attached to a single supplier row. */
export interface RegionPriceSignal extends PriceSignal {
  ingredient: string;
}

export interface AssociationLead {
  source: SourceRef;
  note: string;
  companies: string[];
}

/** One regional JSON file under src/data/suppliers/. */
export interface RegionalDataset {
  schemaVersion: 1;
  /** Kebab-case region key, matches the file name. */
  regionId: string;
  region: string;
  retrieved: string;
  /** Published research document artifact, for the claim-level audit trail. */
  documentArtifact?: string;
  documentPath?: string;
  methodology?: string;
  suppliers: Supplier[];
  priceSignals?: RegionPriceSignal[];
  coverageGaps?: string[];
  associationLeads?: AssociationLead;
}

export interface RegionCount {
  regionId: string;
  region: string;
  supplierCount: number;
}

/** Combined, search-ready dataset produced by the build-time merge. */
export interface CatalogDataset {
  suppliers: Supplier[];
  regionCounts: RegionCount[];
  totalCount: number;
}
