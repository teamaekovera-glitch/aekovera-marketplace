import { describe, expect, it } from "vitest";

import { quarantinedCount } from "@/lib/catalog/display";
import { catalogSuppliers, catalogDataset, regionCounts, regionalDatasets } from "@/lib/catalog/merge";
import {
  categoryEntries,
  filterSuppliersByFacets,
  matchesSubtype,
  regionFacetOptions,
  regionIdByName,
  subtypeFacetOptions,
  suppliersInCategory,
  taxonomyCategories,
  taxonomyCategoryBySlug,
  taxonomyStats,
  REGION_FACET_KEY,
  SUBTYPE_FACET_KEY,
} from "@/lib/taxonomy";

/** All research rows, including the quarantined ones — the hostile input. */
const rawRows = regionalDatasets.flatMap((dataset) => dataset.suppliers);

describe("taxonomy dataset integrity", () => {
  it("has exactly 33 top-level categories with unique slugs", () => {
    expect(taxonomyCategories).toHaveLength(33);
    expect(new Set(taxonomyCategories.map((c) => c.slug)).size).toBe(33);
  });

  it("matches on the category name even when its curated alias list is empty", () => {
    // protein-hydrolysates-peptides has no alias strings in the supplier data
    // (no peptide/hydrolysate category exists in the corpus) — the category is
    // honestly empty, but it must still match its own name if that string
    // appears in a future dataset.
    const protein = taxonomyCategoryBySlug("protein-hydrolysates-peptides");
    if (!protein) throw new Error("missing protein-hydrolysates-peptides category");
    expect(suppliersInCategory(catalogSuppliers, protein)).toHaveLength(0);
    const sample = rawRows[0];
    if (!sample) throw new Error("catalog is empty");
    const named = {
      ...sample,
      categories: { ...sample.categories, value: ["Protein Hydrolysates & Peptides"] },
    };
    expect(suppliersInCategory([named], protein)).toHaveLength(1);
  });

  it("marks subtypes verified or pending, never neither", () => {
    const stats = taxonomyStats();
    expect(stats.categoryCount).toBe(33);
    expect(stats.verifiedSubtypeCount + stats.pendingSubtypeCount).toBe(stats.subtypeCount);
    expect(stats.pendingSubtypeCount).toBeGreaterThan(0);
  });
});

describe("category membership", () => {
  it("recomputes one category count independently of the helper", () => {
    // Double-entry check: intersect cocoa's aliases with the raw rows by hand.
    const category = taxonomyCategoryBySlug("cocoa-coffee-tea");
    if (!category) throw new Error("missing cocoa-coffee-tea category");
    const aliases = new Set(
      [category.name, ...category.aliases].map((a) => a.trim().toLowerCase()),
    );
    const expected = rawRows.filter(
      (s) => !s.quarantined && s.categories.value.some((c) => aliases.has(c.trim().toLowerCase())),
    ).length;
    expect(
      categoryEntries(catalogSuppliers).find((e) => e.slug === "cocoa-coffee-tea")?.supplierCount,
    ).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it("never surfaces a quarantined row through any category, even on raw input", () => {
    expect(quarantinedCount(rawRows)).toBe(10);
    for (const category of taxonomyCategories) {
      for (const supplier of suppliersInCategory(rawRows, category)) {
        expect(supplier.quarantined, `${supplier.id} leaked through ${category.slug}`).toBeUndefined();
      }
    }
  });

  it("lists entry counts for all 33 categories, most non-empty", () => {
    const entries = categoryEntries(catalogSuppliers);
    expect(entries).toHaveLength(33);
    expect(entries.filter((entry) => entry.supplierCount > 0).length).toBeGreaterThanOrEqual(27);
  });
});

describe("verified-only subtype facets", () => {
  it("excludes every [C] subtype from facet options, including data-backed ones", () => {
    let poisonedCases = 0;
    for (const category of taxonomyCategories) {
      const optionNames = new Set(subtypeFacetOptions(rawRows, category).map((o) => o.value));
      const scoped = suppliersInCategory(rawRows, category);
      for (const subtype of category.subtypes) {
        const matchesSome = scoped.some((s) => matchesSubtype(s, subtype.name));
        if (matchesSome && !subtype.verified) {
          // A [C] subtype the dataset would otherwise support — must not render.
          poisonedCases += 1;
          expect(optionNames.has(subtype.name), `[C] subtype "${subtype.name}" leaked`).toBe(false);
        }
      }
    }
    // The exclusion must be load-bearing: at least one [C] subtype would match.
    expect(poisonedCases).toBeGreaterThanOrEqual(1);
  });

  it("orders options deterministically (count desc, then name)", () => {
    for (const category of taxonomyCategories) {
      const options = subtypeFacetOptions(catalogSuppliers, category);
      const sorted = [...options].sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
      );
      expect(options).toEqual(sorted);
    }
  });

  it("renders at least one data-backed option somewhere in the taxonomy", () => {
    const total = taxonomyCategories.reduce(
      (sum, category) => sum + subtypeFacetOptions(catalogSuppliers, category).length,
      0,
    );
    expect(total).toBeGreaterThan(0);
  });
});

describe("facet filtering", () => {
  const taxonomyCategory = taxonomyCategoryBySlug("cocoa-coffee-tea");
  if (!taxonomyCategory) throw new Error("missing cocoa-coffee-tea category");
  const category = taxonomyCategory;
  const scoped = suppliersInCategory(catalogSuppliers, category);

  it("returns everything when nothing is selected", () => {
    expect(filterSuppliersByFacets(scoped, {})).toEqual(scoped);
  });

  it("filters by region display names via the id map", () => {
    const labels = regionIdByName(regionCounts);
    const option = regionFacetOptions(scoped, regionCounts)[0];
    if (!option) throw new Error("no region facet options");
    const filtered = filterSuppliersByFacets(scoped, { [REGION_FACET_KEY]: new Set([option.value]) }, labels);
    const regionId = labels.get(option.value);
    expect(filtered.every((s) => s.regionId === regionId)).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(scoped.length);
  });

  it("combines subtype and region selections with AND", () => {
    const labels = regionIdByName(regionCounts);
    const regionOption = regionFacetOptions(scoped, regionCounts)[0];
    const subtypeOption = subtypeFacetOptions(catalogSuppliers, category)[0];
    if (!regionOption) return; // no region options — nothing to combine
    if (!subtypeOption) return; // category without verified options — covered elsewhere
    const filtered = filterSuppliersByFacets(
      scoped,
      {
        [REGION_FACET_KEY]: new Set([regionOption.value]),
        [SUBTYPE_FACET_KEY]: new Set([subtypeOption.value]),
      },
      labels,
    );
    const regionId = labels.get(regionOption.value);
    expect(
      filtered.every(
        (s) => s.regionId === regionId && matchesSubtype(s, subtypeOption.value),
      ),
    ).toBe(true);
  });

  it("unions multiple subtypes with OR", () => {
    const options = subtypeFacetOptions(catalogSuppliers, category);
    if (options.length < 2) return;
    const pair = new Set(options.slice(0, 2).map((o) => o.value));
    const singles = [...pair].map((name) =>
      filterSuppliersByFacets(scoped, { [SUBTYPE_FACET_KEY]: new Set([name]) }),
    );
    const union = new Set(singles.flatMap((list) => list.map((s) => s.id)));
    const combined = filterSuppliersByFacets(scoped, { [SUBTYPE_FACET_KEY]: pair });
    expect(new Set(combined.map((s) => s.id))).toEqual(union);
  });
});

describe("region entries", () => {
  it("pins the dataset totals the landing page must disclose", () => {
    expect(catalogDataset.totalCount).toBe(258);
    expect(quarantinedCount(rawRows)).toBe(10);
    expect(regionCounts).toHaveLength(6);
  });
});
