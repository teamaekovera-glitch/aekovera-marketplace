// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SupplierDiscovery } from "@/components/discovery/supplier-discovery";
import {
  buildDiscoveryRecords,
  DiscoverySearchClient,
} from "@/components/discovery/search-client";
import { getPublicSupplier } from "@/components/discovery/public-supplier";
import { catalogSuppliers, regionCounts } from "@/lib/catalog/merge";
import chinaJson from "@/data/suppliers/china.json";

afterEach(cleanup);

interface RawChinaRow {
  id: string;
  name: { value: string };
  quarantined?: { reason: string; note?: string };
}

const rawRows = (chinaJson as { suppliers: RawChinaRow[] }).suppliers;
const quarantinedRows = rawRows.filter((row) => row.quarantined !== undefined);
const quarantinedIdSet = new Set(quarantinedRows.map((row) => row.id));
const quarantinedNameSet = new Set(quarantinedRows.map((row) => row.name.value));

const visibleIds = new Set(catalogSuppliers.map((supplier) => supplier.id));
const client = new DiscoverySearchClient(
  buildDiscoveryRecords(catalogSuppliers, regionCounts),
  regionCounts,
);

describe("Quarantine — dataset contract", () => {
  it("holds the 10 quarantined China rows from the normalization decision", () => {
    expect(quarantinedRows.length).toBe(10);
  });

  it("excludes quarantined ids from the merged catalog and discovery records", () => {
    for (const id of quarantinedIdSet) {
      expect(visibleIds.has(id)).toBe(false);
      expect(getPublicSupplier(id)).toBeNull();
    }
    const recordIds = new Set(
      buildDiscoveryRecords(catalogSuppliers, regionCounts).map(
        (record) => record.supplierId
      )
    );
    for (const id of quarantinedIdSet) {
      expect(recordIds.has(id)).toBe(false);
    }
  });

  it("never returns a quarantined row from search, at any query", async () => {
    const probeQueries = ["china", "packaging", "sichuan", "pepper", "gum", ""];
    for (const query of probeQueries) {
      const response = await client.searchCatalog(query, {});
      for (const hit of response.hits) {
        expect(quarantinedIdSet.has(hit.record.supplierId)).toBe(false);
        expect(quarantinedNameSet.has(hit.record.name)).toBe(false);
      }
    }
  });

  it("keeps dataset-level China counts honest (50) while serving zero China rows", async () => {
    const china = regionCounts.find((entry) => entry.region === "China");
    expect(china?.supplierCount).toBe(50);
    expect(visibleIds.size).toBe(258); // 268 research rows − 10 withheld
  });
});

describe("Quarantine — surfaces", () => {
  it("renders no quarantined name on /suppliers while explaining withheld rows", async () => {
    const { container } = render(
      <SupplierDiscovery
        suppliers={catalogSuppliers}
        regionCounts={regionCounts}
        initialResponse={await client.searchCatalog("", {})}
      />
    );
    const text = container.textContent ?? "";
    for (const name of quarantinedNameSet) {
      expect(text.includes(name)).toBe(false);
    }
    expect(container.querySelector("[data-withheld-note]")?.textContent).toContain(
      "10 rows are withheld pending verification"
    );
  });

  it("serves visible suppliers while quarantined ids render notFound", () => {
    const first = catalogSuppliers[0];
    if (!first) throw new Error("catalog must not be empty");
    expect(getPublicSupplier(first.id)?.id).toBe(first.id); // positive control
    for (const id of quarantinedIdSet) {
      expect(getPublicSupplier(id)).toBeNull(); // same 404 as an unknown id
    }
  });
});
