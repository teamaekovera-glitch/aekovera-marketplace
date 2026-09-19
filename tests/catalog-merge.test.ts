import { describe, expect, it } from "vitest";
import {
  catalogDataset,
  catalogSuppliers,
  regionCounts,
  regionalDatasets,
} from "../src/lib/catalog/merge";

describe("catalog merge", () => {
  it("emits correct per-region counts", () => {
    expect(regionCounts).toEqual([
      { regionId: "southeast-asia", region: "Southeast Asia", supplierCount: 41 },
      {
        regionId: "europe-turkey-africa",
        region: "Europe, Turkey and Africa",
        supplierCount: 42,
      },
    ]);
    expect(regionalDatasets.map((r) => r.regionId)).toEqual([
      "southeast-asia",
      "europe-turkey-africa",
    ]);
  });

  it("exports the combined dataset with a matching total", () => {
    expect(catalogDataset.totalCount).toBe(83);
    expect(catalogDataset.suppliers).toHaveLength(catalogSuppliers.length);
    expect(catalogDataset.regionCounts).toEqual([...regionCounts]);
  });

  it("keeps supplier ids unique and region-prefixed", () => {
    const ids = catalogSuppliers.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const supplier of catalogSuppliers) {
      expect(supplier.id.startsWith(`${supplier.regionId}-`)).toBe(true);
    }
  });

  it("carries row-level sources for every supplier", () => {
    for (const supplier of catalogSuppliers) {
      expect(supplier.sources.length).toBeGreaterThan(0);
    }
  });
});
