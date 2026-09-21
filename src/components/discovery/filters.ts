import { priceTierLabel } from "@/lib/catalog/display";
import type { FacetOption } from "@/lib/catalog/display";
import type { PriceTier } from "@/lib/catalog/types";
import type { FacetGroup } from "@/components/catalog/facet-sidebar";
import type {
  CatalogFacetCounts,
  CatalogSearchFilters,
} from "@/lib/search/catalog-types";

/**
 * Facet-to-filter plumbing for the discovery surface: pure functions that
 * turn the search client's facet counts into sidebar groups and the
 * sidebar's selection state back into catalog search filters. Rendering
 * surfaces never hand-roll these mappings.
 */

/** One facet group: the filter field it feeds, its display label, and the facet-count key it reads. */
interface FacetGroupSpec {
  /** Filter field name in CatalogSearchFilters — also the group key in selection state. */
  field: FacetFilterField;
  label: string;
  /** Key in CatalogFacetCounts this group renders. */
  facet: keyof CatalogFacetCounts;
}

/**
 * Filter fields that map 1:1 to a facet group. `countries` has no group:
 * country filtering arrives through search and future dataset needs.
 */
export type FacetFilterField =
  | "regions"
  | "categories"
  | "subtypes"
  | "forms"
  | "certifications"
  | "moqBands"
  | "priceTiers";

const FACET_GROUP_SPECS: readonly FacetGroupSpec[] = [
  { field: "regions", label: "Region", facet: "region" },
  { field: "categories", label: "Category", facet: "category" },
  { field: "subtypes", label: "Subtype", facet: "subtype" },
  { field: "forms", label: "Form", facet: "form" },
  { field: "certifications", label: "Certification", facet: "certification" },
  { field: "moqBands", label: "MOQ band", facet: "moqBand" },
  { field: "priceTiers", label: "Price signal", facet: "priceTiers" },
];

/** The PriceTier union, exhaustively — the base for the label round trip. */
const PRICE_TIERS: readonly PriceTier[] = [
  "supplier-published",
  "marketplace-listed",
  "quote-only",
];

/** The tier whose display label this is, or undefined — the inverse of priceTierLabel. */
export function tierFromLabel(label: string): PriceTier | undefined {
  return PRICE_TIERS.find((tier) => priceTierLabel(tier) === label);
}

/**
 * Sidebar groups from the search client's facet counts. Values are the raw
 * filter values — except price tiers, which display their tier-source label
 * (Rulebook B1) and map back to the tier id in toSearchFilters.
 */
export function buildFacetGroups(counts: CatalogFacetCounts): FacetGroup[] {
  return FACET_GROUP_SPECS.map(({ field, label, facet }) => {
    const options: FacetOption[] = counts[facet].map((entry) => {
      if (field === "priceTiers") {
        const tier: PriceTier | undefined = tierFromLabel(entry.value);
        return { value: tier ? priceTierLabel(tier) : entry.value, count: entry.count };
      }
      return { value: entry.value, count: entry.count };
    });
    return { key: field, label, options };
  });
}

/**
 * Selection state → catalog search filters. Group keys are filter field
 * names, so mapping is direct; price-tier labels map back to tier ids and
 * unmapped labels are dropped (unrepresentable by construction, tested).
 */
export function toSearchFilters(
  selected: Readonly<Record<string, ReadonlySet<string>>>,
): CatalogSearchFilters {
  const valuesFor = (field: FacetFilterField): string[] => {
    return [...(selected[field] ?? new Set<string>())];
  };
  return {
    regions: valuesFor("regions"),
    categories: valuesFor("categories"),
    subtypes: valuesFor("subtypes"),
    forms: valuesFor("forms"),
    certifications: valuesFor("certifications"),
    moqBands: valuesFor("moqBands"),
    priceTiers: valuesFor("priceTiers").flatMap((label) => {
      const tier: PriceTier | undefined = tierFromLabel(label);
      return tier ? [tier] : [];
    }),
  };
}

/** True when the selection state carries at least one active facet value. */
export function hasActiveFacets(
  selected: Readonly<Record<string, ReadonlySet<string>>>,
): boolean {
  return Object.values(selected).some((values) => values.size > 0);
}

/**
 * Rows withheld from publication: the region counts are dataset-level truth
 * (including quarantined rows) while the exported suppliers are the visible
 * subset — the difference is the withheld count.
 */
export function withheldRowCount(
  suppliers: readonly unknown[],
  regionCounts: ReadonlyArray<{ supplierCount: number }>,
): number {
  const datasetTotal = regionCounts.reduce((sum, rc) => sum + rc.supplierCount, 0);
  return datasetTotal - suppliers.length;
}
