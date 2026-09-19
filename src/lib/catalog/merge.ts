import chinaJson from "../../data/suppliers/china.json";
import europeTurkeyAfricaJson from "../../data/suppliers/europe-turkey-africa.json";
import indiaSriLankaJson from "../../data/suppliers/india-sri-lanka.json";
import southeastAsiaJson from "../../data/suppliers/southeast-asia.json";
import { regionalDatasetSchema } from "./schema";
import type { CatalogDataset, RegionalDataset, RegionCount, Supplier } from "./types";

/** Parses a regional JSON import, so an invalid dataset fails the build. */
function parseRegionalDataset(json: unknown, fileName: string): RegionalDataset {
  const result = regionalDatasetSchema.safeParse(json);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid regional catalog data in ${fileName}: ${detail}`);
  }
  return result.data;
}

const europeTurkeyAfrica = parseRegionalDataset(
  europeTurkeyAfricaJson,
  "europe-turkey-africa.json"
);
const southeastAsia = parseRegionalDataset(southeastAsiaJson, "southeast-asia.json");
const china = parseRegionalDataset(chinaJson, "china.json");
const indiaSriLanka = parseRegionalDataset(indiaSriLankaJson, "india-sri-lanka.json");

/** All regional datasets in release order — new regions append here. */
export const regionalDatasets: readonly RegionalDataset[] = [
  southeastAsia,
  europeTurkeyAfrica,
  china,
  indiaSriLanka,
];

/**
 * Public catalog export: quarantined rows (marketplace-tier listings, directory-only
 * profiles) stay out of every export — regionCounts below remain dataset-level.
 */
export const catalogSuppliers: readonly Supplier[] = regionalDatasets.flatMap((dataset) =>
  dataset.suppliers.filter((supplier) => !supplier.quarantined)
);

export const regionCounts: readonly RegionCount[] = regionalDatasets.map((dataset) => ({
  regionId: dataset.regionId,
  region: dataset.region,
  supplierCount: dataset.suppliers.length,
}));

/** The combined, search-ready catalog. */
export const catalogDataset: CatalogDataset = {
  suppliers: [...catalogSuppliers],
  regionCounts: [...regionCounts],
  totalCount: catalogSuppliers.length,
};
