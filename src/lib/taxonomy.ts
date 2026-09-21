import taxonomyJson from "@/data/taxonomy.json";
import { visibleSuppliers } from "@/lib/catalog/display";
import type { FacetOption } from "@/lib/catalog/display";
import type { Supplier } from "@/lib/catalog/types";

/**
 * CPG ingredient taxonomy v1 (research artifact art_5Ld7vheQ), transcribed into
 * a typed dataset. Subtype entries marked verified: false are the artifact's
 * [C] ("category-verified only") backlog — the parent category was verified on
 * a cited page, the subtype itself was not. They are excluded from storefront
 * filters until a supplier page proves them (taxonomy implementation note 3).
 *
 * This module is browse-only glue: it never mutates the catalog data, and it
 * re-applies the quarantine gate on every read so a quarantined row cannot
 * surface through a category page even if a caller passes raw dataset rows.
 */

export interface TaxonomySubtype {
  readonly name: string;
  readonly verified: boolean;
}

export interface TaxonomyCategory {
  readonly slug: string;
  readonly name: string;
  /**
   * Verbatim supplier-side category strings (as recorded in supplier rows,
   * compared case-insensitively) that map onto this taxonomy category. The
   * research corpus uses a free-text category vocabulary, so the mapping is
   * explicit, curated data — reviewable and testable, never inferred.
   */
  readonly aliases: readonly string[];
  readonly subtypes: readonly TaxonomySubtype[];
}

export interface TaxonomyData {
  readonly schemaVersion: number;
  readonly sourceArtifact: string;
  readonly sourceName: string;
  readonly sourceDate: string;
  readonly enumerationNote: string;
  readonly categories: readonly TaxonomyCategory[];
}

const data: TaxonomyData = taxonomyJson;

/** The full taxonomy dataset, in artifact order. */
export const taxonomyData: TaxonomyData = data;

/** All 33 top-level taxonomy categories. */
export const taxonomyCategories: readonly TaxonomyCategory[] = data.categories;

export function taxonomyCategoryBySlug(slug: string): TaxonomyCategory | undefined {
  return taxonomyCategories.find((category) => category.slug === slug);
}

export interface TaxonomyStats {
  readonly categoryCount: number;
  readonly subtypeCount: number;
  readonly verifiedSubtypeCount: number;
  readonly pendingSubtypeCount: number;
}

/** Category and subtype totals, computed from the dataset — never hardcoded. */
export function taxonomyStats(): TaxonomyStats {
  let verified = 0;
  let pending = 0;
  for (const category of taxonomyCategories) {
    for (const subtype of category.subtypes) {
      if (subtype.verified) verified += 1;
      else pending += 1;
    }
  }
  return {
    categoryCount: taxonomyCategories.length,
    subtypeCount: verified + pending,
    verifiedSubtypeCount: verified,
    pendingSubtypeCount: pending,
  };
}

function categoryAliasSet(category: TaxonomyCategory): ReadonlySet<string> {
  // The category's own name always participates in matching; curated aliases
  // supplement it. A category is never structurally dead just because its
  // alias list is empty.
  return new Set([category.name, ...category.aliases].map((alias) => alias.trim().toLowerCase()));
}

/**
 * Suppliers whose recorded categories intersect the taxonomy category's alias
 * list. Quarantined rows are filtered out again here (defense in depth — the
 * catalog export already excludes them), so category pages can never surface
 * one even if handed the raw regional datasets.
 */
export function suppliersInCategory(
  suppliers: readonly Supplier[],
  category: TaxonomyCategory,
): Supplier[] {
  const aliases = categoryAliasSet(category);
  return visibleSuppliers(suppliers).filter((supplier) =>
    supplier.categories.value.some((value) => aliases.has(value.trim().toLowerCase())),
  );
}

/**
 * Deterministic subtype match: case-insensitive containment of the taxonomy
 * subtype name (verbatim, including any qualifier) within one of the
 * supplier's recorded ingredient strings. Browse heuristic for filter counts —
 * it never widens what a supplier row claims.
 */
export function matchesSubtype(supplier: Supplier, subtypeName: string): boolean {
  const needle = subtypeName.trim().toLowerCase();
  return supplier.ingredients.value.some((ingredient) =>
    ingredient.toLowerCase().includes(needle),
  );
}

/**
 * Filter options for a category page: verified ([V]) subtypes only, each
 * backed by at least one supplier in the category, deterministic order
 * (count desc, then name asc). [C] subtypes never appear here regardless of
 * whether the dataset mentions them — that exclusion is load-bearing.
 */
export function subtypeFacetOptions(
  suppliers: readonly Supplier[],
  category: TaxonomyCategory,
): FacetOption[] {
  const scoped = suppliersInCategory(suppliers, category);
  return category.subtypes
    .filter((subtype) => subtype.verified)
    .map((subtype) => ({
      value: subtype.name,
      count: scoped.filter((supplier) => matchesSubtype(supplier, subtype.name)).length,
    }))
    .filter((option) => option.count > 0)
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Group key for the subtype facet on category pages. */
export const SUBTYPE_FACET_KEY = "subtype";
/** Group key for the region facet on category pages. */
export const REGION_FACET_KEY = "region";

export interface BrowseFacetGroup {
  readonly key: string;
  readonly label: string;
  readonly options: readonly FacetOption[];
}

/**
 * Region filter options for a category page, keyed by display name (the
 * FacetSidebar renders `value` verbatim): one option per region actually
 * present among the given (already category-scoped) suppliers.
 */
export function regionFacetOptions(
  suppliers: readonly Supplier[],
  regionCounts: readonly { regionId: string; region: string }[],
): FacetOption[] {
  const names = new Map(regionCounts.map((region) => [region.regionId, region.region]));
  const counts = new Map<string, number>();
  for (const supplier of suppliers) {
    counts.set(supplier.regionId, (counts.get(supplier.regionId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([regionId, count]) => ({ value: names.get(regionId) ?? regionId, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Region display name -> regionId, for translating region facet values. */
export function regionIdByName(
  regionCounts: readonly { regionId: string; region: string }[],
): ReadonlyMap<string, string> {
  return new Map(regionCounts.map((region) => [region.region, region.regionId]));
}

/**
 * Apply a facet selection (facet key -> selected values) to a supplier list.
 * Values within a group combine with OR; groups combine with AND. Unknown
 * group keys are ignored. `regionLabels` maps region display name -> regionId
 * so the region facet can filter on human-readable values; when omitted,
 * region values are treated as raw regionIds. Pure and deterministic — shared
 * by the category browser and its tests.
 */
export function filterSuppliersByFacets(
  suppliers: readonly Supplier[],
  selected: Readonly<Record<string, ReadonlySet<string>>>,
  regionLabels?: ReadonlyMap<string, string>,
): Supplier[] {
  const subtypeSelection = selected[SUBTYPE_FACET_KEY];
  const regionSelection = selected[REGION_FACET_KEY];
  const regionIds = regionSelection
    ? new Set([...regionSelection].map((value) => regionLabels?.get(value) ?? value))
    : undefined;
  return suppliers.filter((supplier) => {
    if (regionIds && regionIds.size > 0 && !regionIds.has(supplier.regionId)) {
      return false;
    }
    if (subtypeSelection && subtypeSelection.size > 0) {
      return [...subtypeSelection].some((subtypeName) => matchesSubtype(supplier, subtypeName));
    }
    return true;
  });
}

export interface CategoryEntry {
  readonly slug: string;
  readonly name: string;
  readonly supplierCount: number;
}

/** Landing-page category links: all 33 categories with live supplier counts. */
export function categoryEntries(suppliers: readonly Supplier[]): CategoryEntry[] {
  return taxonomyCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    supplierCount: suppliersInCategory(suppliers, category).length,
  }));
}

export interface RegionEntry {
  readonly regionId: string;
  readonly region: string;
  /** Suppliers actually listed (quarantine-gated) — dataset-level counts lie. */
  readonly supplierCount: number;
  /** Rows withheld pending verification, disclosed per region. */
  readonly withheldCount: number;
}

/**
 * Landing-page region entry points, in dataset release order: visible supplier
 * counts computed from the merged catalog, plus the per-region withheld count
 * (dataset-level minus visible) so quarantine stays reason-bearing, never
 * silent.
 */
export function regionEntries(
  suppliers: readonly Supplier[],
  regionCounts: readonly { regionId: string; region: string; supplierCount: number }[],
): RegionEntry[] {
  const visible = new Map<string, number>();
  for (const supplier of visibleSuppliers(suppliers)) {
    visible.set(supplier.regionId, (visible.get(supplier.regionId) ?? 0) + 1);
  }
  return regionCounts.map((region) => {
    const listed = visible.get(region.regionId) ?? 0;
    return {
      regionId: region.regionId,
      region: region.region,
      supplierCount: listed,
      withheldCount: region.supplierCount - listed,
    };
  });
}
