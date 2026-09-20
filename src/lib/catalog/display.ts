import type { CertificationStatus, PriceTier, Supplier } from "./types";

/**
 * Pure display helpers for the catalog components. Trust invariants live
 * here so every list, grid, and chip renders through the same gate —
 * rendering surfaces never re-implement these rules.
 */

/** Maximum suppliers compared side-by-side (spec: comparison v1). */
export const MAX_COMPARE = 3;

/**
 * Quarantined rows are withheld from publication pending verification.
 * Every list and grid maps over this gate, so quarantined data is
 * unreachable from rendering; the row's withheld state is reason-bearing,
 * never a silent drop.
 */
export function visibleSuppliers(suppliers: readonly Supplier[]): Supplier[] {
  return suppliers.filter((supplier) => !supplier.quarantined);
}

/** How many rows the catalog is currently withholding. */
export function quarantinedCount(suppliers: readonly Supplier[]): number {
  return suppliers.length - visibleSuppliers(suppliers).length;
}

/**
 * Certification chips render Company-stated only (v1 records certifications
 * as they appear on the fetched page — never registry-verified). The label
 * map is exhaustive over CertificationStatus, so a "Verified" chip is
 * unrepresentable: a new status either maps to a declared label or the
 * typechecker rejects it.
 */
const CERT_CHIP_LABELS: Record<CertificationStatus, "Company-stated"> = {
  "company-stated": "Company-stated",
};

export function certificationChipLabel(status: CertificationStatus): "Company-stated" {
  return CERT_CHIP_LABELS[status];
}

/** Price tiers are labeled by their evidence source (Rulebook B1). */
const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  "supplier-published": "Supplier-published",
  "marketplace-listed": "Marketplace-listed",
  "quote-only": "Quote-only",
};

export function priceTierLabel(tier: PriceTier): string {
  return PRICE_TIER_LABELS[tier];
}

export type FacetField = "categories" | "ingredients";

export interface FacetOption {
  value: string;
  count: number;
}

/**
 * Distinct facet values with visible-row counts — quarantined rows never
 * contribute to a facet.
 */
export function facetCounts(
  suppliers: readonly Supplier[],
  field: FacetField
): FacetOption[] {
  const counts = new Map<string, number>();
  for (const supplier of visibleSuppliers(suppliers)) {
    for (const value of supplier[field].value) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
