import { describe, expect, it } from "vitest";
import {
  catalogDataset,
  catalogSuppliers,
  regionCounts,
  regionalDatasets,
} from "../src/lib/catalog/merge";

describe("catalog merge", () => {
  it("emits correct per-region counts (dataset-level)", () => {
    expect(regionCounts).toEqual([
      { regionId: "southeast-asia", region: "Southeast Asia", supplierCount: 41 },
      {
        regionId: "europe-turkey-africa",
        region: "Europe, Turkey and Africa",
        supplierCount: 42,
      },
      { regionId: "china", region: "China", supplierCount: 50 },
      { regionId: "india-sri-lanka", region: "India & Sri Lanka", supplierCount: 32 },
      { regionId: "latin-america", region: "Latin America", supplierCount: 39 },
    ]);
    expect(regionalDatasets.map((r) => r.regionId)).toEqual([
      "southeast-asia",
      "europe-turkey-africa",
      "china",
      "india-sri-lanka",
      "latin-america",
    ]);
  });

  it("exports the combined dataset with a matching total", () => {
    // 204 dataset rows minus the 10 quarantined China rows (41 + 42 + 50 + 32 + 39 - 10).
    expect(catalogDataset.totalCount).toBe(194);
    expect(catalogDataset.suppliers).toHaveLength(catalogSuppliers.length);
    expect(catalogDataset.regionCounts).toEqual([...regionCounts]);
  });

  it("exports china's 40 non-quarantined rows of its 50 dataset rows", () => {
    const chinaExported = catalogSuppliers.filter((s) => s.regionId === "china");
    expect(chinaExported).toHaveLength(40);
  });

  it("excludes quarantined rows from the public export", () => {
    for (const supplier of catalogSuppliers) {
      expect(supplier.quarantined, `${supplier.id} is quarantined but exported`).toBeUndefined();
    }
    const quarantinedChinaIds = [
      "china-011",
      "china-015",
      "china-036",
      "china-037",
      "china-038",
      "china-039",
      "china-040",
      "china-042",
      "china-045",
      "china-049",
    ];
    const exportedIds = new Set(catalogSuppliers.map((s) => s.id));
    for (const id of quarantinedChinaIds) {
      expect(exportedIds.has(id), `${id} must not appear in the public export`).toBe(false);
    }
    // Bookkeeping stays reconciled whatever regions append later: the export is
    // exactly the dataset rows minus the quarantined ones.
    const datasetTotal = regionalDatasets.reduce((n, d) => n + d.suppliers.length, 0);
    const quarantinedTotal = regionalDatasets.reduce(
      (n, d) => n + d.suppliers.filter((s) => s.quarantined).length,
      0
    );
    expect(catalogSuppliers).toHaveLength(datasetTotal - quarantinedTotal);
    expect(catalogDataset.totalCount).toBe(datasetTotal - quarantinedTotal);
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
