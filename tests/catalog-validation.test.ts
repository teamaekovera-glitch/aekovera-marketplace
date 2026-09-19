import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCatalogFiles, type CatalogFileInput } from "../src/lib/catalog/validate";

function load(path: string): CatalogFileInput {
  return { path, json: JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) };
}

const sea = load("src/data/suppliers/southeast-asia.json");
const eta = load("src/data/suppliers/europe-turkey-africa.json");
const datasets: [string, CatalogFileInput][] = [
  ["southeast-asia", sea],
  ["europe-turkey-africa", eta],
];
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

  it("passes the 42 normalized Europe/Turkey/Africa rows", () => {
    const result = validateCatalogFiles([eta]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(42);
    expect(result.perRegionCounts).toEqual([
      { regionId: "europe-turkey-africa", region: "Europe, Turkey and Africa", supplierCount: 42 },
    ]);
  });

  it("validates both regions together (83 suppliers)", () => {
    const result = validateCatalogFiles([sea, eta]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(83);
    expect(result.perRegionCounts).toEqual([
      { regionId: "southeast-asia", region: "Southeast Asia", supplierCount: 41 },
      { regionId: "europe-turkey-africa", region: "Europe, Turkey and Africa", supplierCount: 42 },
    ]);
  });

  it("renders every certification as company-stated (corpus-wide rule, pending registry cross-checks)", () => {
    let certCount = 0;
    for (const [, file] of datasets) {
      const dataset = file.json as {
        suppliers: {
          id: string;
          certifications: { value: { name: string; status: string; source: { url: string; retrievedAt: string } }[] };
        }[];
      };
      for (const supplier of dataset.suppliers) {
        for (const cert of supplier.certifications.value) {
          certCount += 1;
          expect(cert.status, `${supplier.id}: ${cert.name}`).toBe("company-stated");
          expect(cert.name.length, `${supplier.id} cert name`).toBeGreaterThan(0);
          expect(cert.source.url, `${supplier.id}: ${cert.name}`).toMatch(/^https?:\/\//);
          expect(cert.source.retrievedAt, `${supplier.id}: ${cert.name}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    }
    expect(certCount).toBeGreaterThan(0);
  });

  it.each(datasets)(
    "gives every non-null display field a claim-level SourceRef (%s)",
    (_region, file: CatalogFileInput) => {
      const dataset = file.json as {
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
    }
  );

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

describe("europe-turkey-africa dossier fidelity (art_KI4Y9iWa)", () => {
  const dataset = eta.json as {
    regionId: string;
    region: string;
    retrieved: string;
    documentArtifact?: string;
    suppliers: {
      id: string;
      confidence: string;
      sources: { url: string; retrievedAt: string }[];
      priceSignals: { tier: string; value?: string }[];
    }[];
  };

  it("pins the dossier artifact, region identity, and retrieval date", () => {
    expect(dataset.regionId).toBe("europe-turkey-africa");
    expect(dataset.region).toBe("Europe, Turkey and Africa");
    expect(dataset.retrieved).toBe("2026-09-19");
    expect(dataset.documentArtifact).toBe("art_KI4Y9iWa");
  });

  it("carries all 42 rows with sequential dossier ordinals", () => {
    expect(dataset.suppliers).toHaveLength(42);
    dataset.suppliers.forEach((supplier, i) => {
      expect(supplier.id).toBe(`europe-turkey-africa-${String(i + 1).padStart(3, "0")}`);
    });
  });

  it("records every row source as read on the dossier retrieval date", () => {
    for (const supplier of dataset.suppliers) {
      expect(supplier.sources.length, supplier.id).toBeGreaterThan(0);
      for (const source of supplier.sources) {
        expect(source.url, supplier.id).toMatch(/^https:\/\//);
        expect(source.retrievedAt, supplier.id).toBe("2026-09-19");
      }
    }
  });

  // Row-level confidence is the dossier's own per-supplier table. Its coarse
  // quality summary ("30 high / 9 medium / 3 low") does not reconcile with that
  // table (28 high / 7 medium / 5 medium-high / 2 low-tier, GCEX and Limpopo
  // Marula); the row-level table wins and the summary discrepancy is noted for
  // review rather than papered over.
  it("carries the dossier's row-level confidence distribution", () => {
    const counts: Record<string, number> = {};
    for (const supplier of dataset.suppliers) {
      counts[supplier.confidence] = (counts[supplier.confidence] ?? 0) + 1;
    }
    expect(counts).toEqual({ High: 28, "Medium-High": 5, Medium: 7, Low: 2 });
  });

  it("labels every price signal with an evidence tier (quote-only carries no figure)", () => {
    let quoteOnly = 0;
    let figureBacked = 0;
    for (const supplier of dataset.suppliers) {
      expect(supplier.priceSignals.length, supplier.id).toBeGreaterThan(0);
      for (const signal of supplier.priceSignals) {
        expect(["supplier-published", "marketplace-listed", "quote-only"]).toContain(signal.tier);
        if (signal.tier === "quote-only") {
          expect(signal.value, `${supplier.id}: quote-only signal carries a figure`).toBeUndefined();
          quoteOnly += 1;
        } else {
          expect(signal.value, `${supplier.id}: ${signal.tier} signal missing verbatim value`).toBeDefined();
          figureBacked += 1;
        }
      }
    }
    expect(quoteOnly + figureBacked).toBe(42);
  });
});
