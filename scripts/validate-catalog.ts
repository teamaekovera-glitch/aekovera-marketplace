/**
 * CI gate: validates every regional catalog file under src/data/suppliers/.
 * Exits 1 on invalid rows, missing claim-level SourceRefs, or unknown tiers.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { validateCatalogFiles, type CatalogFileInput } from "../src/lib/catalog/validate";

const suppliersDir = join(process.cwd(), "src", "data", "suppliers");

function loadFiles(): CatalogFileInput[] {
  return readdirSync(suppliersDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const path = join(suppliersDir, name);
      try {
        return { path: name, json: JSON.parse(readFileSync(path, "utf8")) };
      } catch (cause) {
        throw new Error(`${name} is not valid JSON: ${(cause as Error).message}`);
      }
    });
}

const result = validateCatalogFiles(loadFiles());

for (const issue of result.issues) {
  const where = issue.supplierId ? ` [${issue.supplierId}]` : "";
  console.error(`✗ ${issue.file}${where}: ${issue.message}`);
}

if (result.valid) {
  const counts = result.perRegionCounts
    .map((r) => `${r.regionId}=${r.supplierCount}`)
    .join(", ");
  console.log(
    `✓ catalog valid: ${result.supplierCount} suppliers across ${result.filesValidated} region file(s) (${counts})`
  );
  process.exit(0);
}

console.error(
  `\ncatalog validation failed: ${result.issues.length} issue(s) in ${result.filesValidated} file(s)`
);
process.exit(1);
