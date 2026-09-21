// Node environment: pure search-layer parity, no DOM.
import { describe, expect, it } from "vitest";
import {
  buildDiscoveryRecords,
  DiscoverySearchClient,
} from "@/components/discovery/search-client";
import { createCatalogSearchClient } from "@/lib/search/catalog-local";
import { catalogSuppliers, regionCounts } from "@/lib/catalog/merge";
import type { CatalogSearchFilters } from "@/lib/search/catalog-types";

/**
 * The /suppliers surface serves results through the client-safe wrapper.
 * This pins wrapper === canonical client over the real merged dataset, so
 * a future hosted-search swap behind the canonical client cannot silently
 * change what buyers see here.
 */

const wrapper = new DiscoverySearchClient(
  buildDiscoveryRecords(catalogSuppliers, regionCounts),
  regionCounts,
);
const canonical = createCatalogSearchClient();

const queries = [
  "",
  "coffee",
  "monk fruit",
  "sea cucumber",
  "citric acid",
  "gellan gum",
  "zzqqxx",
] as const;

const filterCases: CatalogSearchFilters[] = [
  {},
  { regions: ["Southeast Asia"] },
  { regions: ["Southeast Asia", "Latin America"] },
  { categories: ["Thickeners & Gums"] },
  { certifications: ["HACCP"], priceTiers: ["quote-only"] },
  { moqBands: ["<=25 kg"] },
  { forms: ["powder"] },
  { subtypes: ["vanilla"] },
];

describe("DiscoverySearchClient — parity with the canonical catalog client", () => {
  for (const query of queries) {
    it(`matches for query "${query || "(browse)"}" with no filters`, async () => {
      const [fromWrapper, fromCanonical] = await Promise.all([
        wrapper.searchCatalog(query, {}),
        canonical.searchCatalog(query, {}),
      ]);
      expect(fromWrapper).toEqual(fromCanonical);
    });
  }

  for (const filters of filterCases) {
    const label = Object.entries(filters)
      .map(([key, value]) => `${key}=${(value as string[]).join("|")}`)
      .join("; ");
    it(`matches for filters [${label}]`, async () => {
      const [fromWrapper, fromCanonical] = await Promise.all([
        wrapper.searchCatalog("", filters),
        canonical.searchCatalog("", filters),
      ]);
      expect(fromWrapper).toEqual(fromCanonical);
    });
  }

  it("matches a combined query + filters call", async () => {
    const [fromWrapper, fromCanonical] = await Promise.all([
      wrapper.searchCatalog("powder", { regions: ["US and Canada"], forms: ["powder"] }),
      canonical.searchCatalog("powder", {
        regions: ["US and Canada"],
        forms: ["powder"],
      }),
    ]);
    expect(fromWrapper).toEqual(fromCanonical);
  });
});
