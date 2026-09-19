import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCatalogFiles, type CatalogFileInput } from "../src/lib/catalog/validate";

function load(path: string): CatalogFileInput {
  return { path, json: JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) };
}

const sea = load("src/data/suppliers/southeast-asia.json");
const fixtures = [
  "tests/fixtures/catalog/missing-source/fixture-region.json",
  "tests/fixtures/catalog/unknown-tier/fixture-region.json",
  "tests/fixtures/catalog/bad-date/fixture-region.json",
  "tests/fixtures/catalog/region-mismatch/fixture-region.json",
].map(load);

describe("catalog validation", () => {
  it("passes the 41 remapped SEA rows", () => {
    const result = validateCatalogFiles([sea]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(41);
    expect(result.perRegionCounts).toEqual([
      { regionId: "southeast-asia", region: "Southeast Asia", supplierCount: 41 },
    ]);
  });

  it("gives every non-null display field a claim-level SourceRef", () => {
    const dataset = sea.json as {
      suppliers: Record<string, { value?: unknown; source?: unknown } | null>[];
    };
    const displayFields = [
      "name",
      "website",
      "hq",
      "country",
      "regionsServed",
      "categories",
      "ingredients",
      "type",
      "certifications",
      "moq",
      "samplePolicy",
      "capacity",
      "reviewPresence",
    ];
    for (const supplier of dataset.suppliers) {
      for (const field of displayFields) {
        const value = supplier[field];
        if (value === null) continue;
        expect(value, `${supplier.id}.${field}`).toHaveProperty("source");
        const source = (value as { source: { url: string; retrievedAt: string } }).source;
        expect(source.url, `${supplier.id}.${field}`).toMatch(/^https?:\/\//);
        expect(source.retrievedAt, `${supplier.id}.${field}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it.each(fixtures.map((f) => [f.path, f]))(
    "rejects malformed fixture %s",
    (path, file: CatalogFileInput) => {
      const result = validateCatalogFiles([file]);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      if (path.includes("missing-source")) {
        expect(result.issues.some((i) => i.message.includes("source"))).toBe(true);
      }
      if (path.includes("unknown-tier")) {
        expect(result.issues.some((i) => i.message.includes("Invalid enum value"))).toBe(true);
      }
      if (path.includes("bad-date")) {
        expect(result.issues.some((i) => i.message.includes("retrieved"))).toBe(true);
      }
      if (path.includes("region-mismatch")) {
        expect(result.issues.some((i) => i.message.includes("must match file name"))).toBe(true);
      }
    }
  );

  it("fails when no catalog files are present", () => {
    const result = validateCatalogFiles([]);
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain("no catalog files");
  });
});
