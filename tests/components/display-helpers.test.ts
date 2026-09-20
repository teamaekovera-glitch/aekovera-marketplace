import { describe, expect, it } from "vitest";
import {
  MAX_COMPARE,
  certificationChipLabel,
  facetCounts,
  priceTierLabel,
  quarantinedCount,
  visibleSuppliers,
} from "@/lib/catalog/display";
import {
  baseSupplier,
  demoSourceRef,
  makeSupplier,
  quarantinedSupplier,
  supplierWithUnknowns,
} from "@/lib/catalog/fixtures";

describe("visibleSuppliers", () => {
  it("excludes quarantined rows and reports the withheld count", () => {
    const suppliers = [baseSupplier, quarantinedSupplier, supplierWithUnknowns];
    const visible = visibleSuppliers(suppliers);
    expect(visible.map((s) => s.id)).toEqual([baseSupplier.id, supplierWithUnknowns.id]);
    expect(quarantinedCount(suppliers)).toBe(1);
  });

  it("keeps every row when none are quarantined", () => {
    const suppliers = [baseSupplier, supplierWithUnknowns];
    expect(visibleSuppliers(suppliers)).toHaveLength(2);
    expect(quarantinedCount(suppliers)).toBe(0);
  });

  it("returns an empty array for empty input", () => {
    expect(visibleSuppliers([])).toEqual([]);
  });
});

describe("certificationChipLabel", () => {
  it("maps the only legal status to Company-stated", () => {
    expect(certificationChipLabel("company-stated")).toBe("Company-stated");
  });
});

describe("priceTierLabel", () => {
  it("labels all three tiers", () => {
    expect(priceTierLabel("supplier-published")).toBe("Supplier-published");
    expect(priceTierLabel("marketplace-listed")).toBe("Marketplace-listed");
    expect(priceTierLabel("quote-only")).toBe("Quote-only");
  });
});

describe("facetCounts", () => {
  it("counts values across visible rows only, sorted by count then value", () => {
    const coffee = { value: ["coffee"], source: demoSourceRef };
    const spices = { value: ["spices"], source: demoSourceRef };
    const hidden = makeSupplier({
      id: "demo-hidden",
      categories: coffee,
      quarantined: { reason: "withheld" },
    });
    const first = makeSupplier({ id: "demo-a", categories: coffee });
    const second = makeSupplier({ id: "demo-b", categories: coffee });
    const third = makeSupplier({ id: "demo-c", categories: spices });

    const counts = facetCounts([hidden, first, second, third], "categories");
    expect(counts).toEqual([
      { value: "coffee", count: 2 },
      { value: "spices", count: 1 },
    ]);
  });

  it("breaks count ties alphabetically", () => {
    const a = { value: ["alpha"], source: demoSourceRef };
    const b = { value: ["beta"], source: demoSourceRef };
    const counts = facetCounts(
      [makeSupplier({ id: "demo-a", categories: a }), makeSupplier({ id: "demo-b", categories: b })],
      "categories"
    );
    expect(counts.map((c) => c.value)).toEqual(["alpha", "beta"]);
  });

  it("returns an empty facet for no rows", () => {
    expect(facetCounts([], "ingredients")).toEqual([]);
  });
});

describe("MAX_COMPARE", () => {
  it("is capped at 3 per spec", () => {
    expect(MAX_COMPARE).toBe(3);
  });
});
