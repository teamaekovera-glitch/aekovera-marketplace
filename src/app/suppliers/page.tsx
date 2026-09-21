import type { Metadata } from "next";
import { catalogSuppliers, regionCounts } from "@/lib/catalog/merge";
import {
  buildDiscoveryRecords,
  DiscoverySearchClient,
} from "@/components/discovery/search-client";
import { SupplierDiscovery } from "@/components/discovery/supplier-discovery";

/**
 * /suppliers — the discovery surface (spec art_mGbk9PCA). The server page
 * builds the search client over the visible catalog only (the merge module
 * already excludes the 10 quarantined China rows), computes the browse-mode
 * response at build time, and hands everything to the client orchestrator —
 * no client-side flash of unsorted content, and the client graph never
 * imports the merged dataset.
 */

export const metadata: Metadata = {
  title: "Ingredient suppliers — Aekovera Marketplace",
  description:
    "Search ingredient suppliers by keyword and taxonomy facets. Every claim links to the page it was read from; anything unsourced is labeled Unknown.",
};

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  // Region deep-links (landing entry points) carry the regionId; the region
  // facet filters on the region name, so map through regionCounts. An unknown
  // regionId degrades to browse mode instead of a broken facet.
  const regionId = typeof params.region === "string" ? params.region : "";
  const regionMatch = regionCounts.find((region) => region.regionId === regionId);
  const initialRegions = regionMatch ? [regionMatch.region] : undefined;

  const client = new DiscoverySearchClient(
    buildDiscoveryRecords(catalogSuppliers, regionCounts),
    regionCounts,
  );
  const initialResponse = await client.searchCatalog(
    query,
    initialRegions ? { regions: initialRegions } : {},
  );

  return (
    <SupplierDiscovery
      suppliers={catalogSuppliers}
      regionCounts={regionCounts}
      initialResponse={initialResponse}
      initialQuery={query}
      initialRegions={initialRegions}
    />
  );
}
