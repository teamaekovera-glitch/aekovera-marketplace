import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCatalogFiles, type CatalogFileInput } from "../src/lib/catalog/validate";

function load(path: string): CatalogFileInput {
  return { path, json: JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) };
}

const sea = load("src/data/suppliers/southeast-asia.json");
const eta = load("src/data/suppliers/europe-turkey-africa.json");
const china = load("src/data/suppliers/china.json");
const indiaSriLanka = load("src/data/suppliers/india-sri-lanka.json");
const latam = load("src/data/suppliers/latin-america.json");
const usCanada = load("src/data/suppliers/us-canada.json");
const datasets: [string, CatalogFileInput][] = [
  ["southeast-asia", sea],
  ["europe-turkey-africa", eta],
  ["china", china],
  ["india-sri-lanka", indiaSriLanka],
  ["latin-america", latam],
  ["us-canada", usCanada],
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

  it("passes the 50 normalized China rows", () => {
    const result = validateCatalogFiles([china]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(50);
    expect(result.perRegionCounts).toEqual([
      { regionId: "china", region: "China", supplierCount: 50 },
    ]);
  });

  it("passes the 32 normalized India/Sri Lanka rows", () => {
    const result = validateCatalogFiles([indiaSriLanka]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(32);
    expect(result.perRegionCounts).toEqual([
      { regionId: "india-sri-lanka", region: "India & Sri Lanka", supplierCount: 32 },
    ]);
  });

  it("passes the 39 remapped Latin America rows", () => {
    const result = validateCatalogFiles([latam]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(39);
    expect(result.perRegionCounts).toEqual([
      { regionId: "latin-america", region: "Latin America", supplierCount: 39 },
    ]);
  });

  it("passes the 50 US/Canada rows", () => {
    const result = validateCatalogFiles([usCanada]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(50);
    expect(result.perRegionCounts).toEqual([
      { regionId: "us-canada", region: "US and Canada", supplierCount: 50 },
    ]);
  });

  it("validates all regions together (254 source rows)", () => {
    const result = validateCatalogFiles([sea, eta, china, indiaSriLanka, latam, usCanada]);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.supplierCount).toBe(254);
    expect(result.perRegionCounts).toEqual([
      { regionId: "southeast-asia", region: "Southeast Asia", supplierCount: 41 },
      { regionId: "europe-turkey-africa", region: "Europe, Turkey and Africa", supplierCount: 42 },
      { regionId: "china", region: "China", supplierCount: 50 },
      { regionId: "india-sri-lanka", region: "India & Sri Lanka", supplierCount: 32 },
      { regionId: "latin-america", region: "Latin America", supplierCount: 39 },
      { regionId: "us-canada", region: "US and Canada", supplierCount: 50 },
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

  it("tiers US/Canada price signals as sourced — supplier-published or quote-only, never marketplace-listed", () => {
    const dataset = usCanada.json as {
      suppliers: {
        id: string;
        priceSignals: { tier: string; value?: string; note?: string; source: { url: string } }[];
      }[];
    };

    // Dossier records no marketplace prices for US/Canada — every signal is row-attached.
    for (const supplier of dataset.suppliers) {
      for (const signal of supplier.priceSignals) {
        expect(signal.tier, supplier.id).not.toBe("marketplace-listed");
      }
    }

    // Dossier summary table marks exactly 10 rows Supplier-published (rows 1, 4, 6, 7,
    // 8, 10, 31, 34, 36, 37) — BulkSupplements' pricing cell is "Retail e-commerce".
    expect(
      dataset.suppliers
        .filter((s) => s.priceSignals.some((p) => p.tier === "supplier-published"))
        .map((s) => s.id)
    ).toEqual([
      "us-canada-001",
      "us-canada-004",
      "us-canada-006",
      "us-canada-007",
      "us-canada-008",
      "us-canada-010",
      "us-canada-031",
      "us-canada-034",
      "us-canada-036",
      "us-canada-037",
    ]);

    // Supplier-published figures stay supplier-published, cited to the supplier's own pages.
    const royal = dataset.suppliers.find((s) => s.id === "us-canada-001");
    expect(royal?.priceSignals[0]?.tier).toBe("supplier-published");
    expect(royal?.priceSignals[0]?.value).toBeTruthy();
    expect(royal?.priceSignals[0]?.source.url).toContain("royalcoffee.com");

    // Quote-only rows carry a sourced signal, not an invented value.
    for (const supplier of dataset.suppliers) {
      for (const signal of supplier.priceSignals) {
        if (signal.tier === "quote-only") {
          expect(signal.value, supplier.id).toBeUndefined();
        }
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

  it("records every row source as read on the dossier retrieval date or the 2026-09-21 audit re-read", () => {
    // The 2026-09-21 URL-audit corrections re-read and, where a claim was
    // re-sourced, re-fetched some supplier pages; those sources carry the audit
    // date. Every date must still be an actual read date.
    const KNOWN_READ_DATES = new Set(["2026-09-19", "2026-09-21"]);
    for (const supplier of dataset.suppliers) {
      expect(supplier.sources.length, supplier.id).toBeGreaterThan(0);
      for (const source of supplier.sources) {
        expect(source.url, supplier.id).toMatch(/^https:\/\//);
        expect(KNOWN_READ_DATES.has(source.retrievedAt), supplier.id).toBe(true);
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

describe("china dossier fidelity (art_VjN8Y0Ge)", () => {
  const dataset = china.json as {
    regionId: string;
    region: string;
    retrieved: string;
    documentArtifact?: string;
    suppliers: {
      id: string;
      confidence: string;
      sources: { url: string; retrievedAt: string }[];
      priceSignals: { tier: string; value?: string }[];
      quarantined?: { reason: string; note?: string };
    }[];
  };

  it("pins the dossier artifact, region identity, and retrieval date", () => {
    expect(dataset.regionId).toBe("china");
    expect(dataset.region).toBe("China");
    expect(dataset.retrieved).toBe("2026-09-19");
    expect(dataset.documentArtifact).toBe("art_VjN8Y0Ge");
  });

  it("carries all 50 rows with sequential dossier ordinals", () => {
    expect(dataset.suppliers).toHaveLength(50);
    dataset.suppliers.forEach((supplier, i) => {
      expect(supplier.id).toBe(`china-${String(i + 1).padStart(3, "0")}`);
    });
  });

  it("records every row source as read on the dossier retrieval date or the 2026-09-21 audit re-read", () => {
    // The 2026-09-21 URL-audit corrections re-read and, where a claim was
    // re-sourced, re-fetched some supplier pages; those sources carry the audit
    // date. Every date must still be an actual read date.
    const KNOWN_READ_DATES = new Set(["2026-09-19", "2026-09-21"]);
    for (const supplier of dataset.suppliers) {
      expect(supplier.sources.length, supplier.id).toBeGreaterThan(0);
      for (const source of supplier.sources) {
        expect(source.url, supplier.id).toMatch(/^https?:\/\//);
        expect(KNOWN_READ_DATES.has(source.retrievedAt), supplier.id).toBe(true);
      }
    }
  });

  it("carries the dossier's row-level confidence distribution", () => {
    const counts: Record<string, number> = {};
    for (const supplier of dataset.suppliers) {
      counts[supplier.confidence] = (counts[supplier.confidence] ?? 0) + 1;
    }
    // 2026-09-21 URL audit: china-022 (Ningxia Eppen) downgraded Medium → Low;
    // its cited domain now redirects to a different company (Starlake
    // Bioscience), so its identity claims are unverified.
    expect(counts).toEqual({ High: 20, "Medium-High": 4, Medium: 24, Low: 2 });
  });

  it("labels every price signal with an evidence tier (quote-only carries no figure)", () => {
    let signalCount = 0;
    for (const supplier of dataset.suppliers) {
      expect(supplier.priceSignals.length, supplier.id).toBeGreaterThan(0);
      for (const signal of supplier.priceSignals) {
        expect(["supplier-published", "marketplace-listed", "quote-only"]).toContain(signal.tier);
        if (signal.tier === "quote-only") {
          expect(signal.value, `${supplier.id}: quote-only signal carries a figure`).toBeUndefined();
        }
        signalCount += 1;
      }
    }
    expect(signalCount).toBeGreaterThan(0);
  });

  it("quarantines exactly the 1 directory-only and 9 marketplace-tier rows, each with a recorded reason", () => {
    const quarantinedIds = dataset.suppliers.filter((s) => s.quarantined).map((s) => s.id);
    expect(quarantinedIds).toEqual([
      "china-011", // directory-only: official site unreachable on two fetch attempts
      "china-015", // marketplace: Made-in-China showroom; own domain no longer serves the company
      "china-036", // marketplace: Made-in-China audited-supplier listing
      "china-037", // marketplace: Made-in-China audited-supplier listing
      "china-038", // marketplace: Made-in-China audited-supplier listing
      "china-039", // marketplace: Made-in-China audited-supplier listing
      "china-040", // marketplace: Made-in-China audited-supplier listing
      "china-042", // marketplace: Made-in-China audited-supplier listing
      "china-045", // marketplace: Made-in-China audited-supplier listing
      "china-049", // marketplace: GoldSupplier profile
    ]);
    for (const supplier of dataset.suppliers) {
      if (!supplier.quarantined) continue;
      expect(supplier.quarantined.reason.trim().length, `${supplier.id}: empty quarantine reason`).toBeGreaterThan(0);
    }
  });
});

describe("india-sri-lanka dossier fidelity (art_GfNGlM9s)", () => {
  const dataset = indiaSriLanka.json as {
    regionId: string;
    region: string;
    retrieved: string;
    documentArtifact?: string;
    suppliers: {
      id: string;
      priceSignals: { tier: string; value?: string; source: { url: string } }[];
    }[];
    priceSignals: { tier: string; value?: string; source: { url: string } }[];
  };

  it("pins the dossier artifact, region identity, and retrieval date", () => {
    expect(dataset.regionId).toBe("india-sri-lanka");
    expect(dataset.region).toBe("India & Sri Lanka");
    expect(dataset.retrieved).toBe("2026-09-19");
    expect(dataset.documentArtifact).toBe("art_GfNGlM9s");
  });

  it("carries all 32 rows with sequential dossier ordinals", () => {
    expect(dataset.suppliers).toHaveLength(32);
    dataset.suppliers.forEach((supplier, i) => {
      expect(supplier.id).toBe(`india-sri-lanka-${String(i + 1).padStart(3, "0")}`);
    });
  });

  it("labels marketplace-listed price signals with canonical IndiaMART URLs, never as supplier rows", () => {
    // IndiaMART evidence stays region-level: no supplier row presents a
    // marketplace listing as its own price signal (Rulebook B1 — never
    // supplier-published).
    for (const supplier of dataset.suppliers) {
      for (const signal of supplier.priceSignals) {
        expect(signal.tier, supplier.id).not.toBe("marketplace-listed");
      }
    }

    const regionSignals = dataset.priceSignals ?? [];
    expect(regionSignals.length).toBeGreaterThan(0);
    for (const signal of regionSignals) {
      if (signal.tier === "marketplace-listed") {
        expect(signal.value, signal.source.url).toBeTruthy();
        expect(signal.source.url, signal.value).toMatch(/^https:\/\/(www\.)?indiamart\.com\//);
      }
    }

    // Own-site published price keeps the supplier-published tier — the
    // IndiaMART-format profile page lives on the company's own domain, not
    // on the marketplace.
    const angel = dataset.suppliers.find((s) => s.id === "india-sri-lanka-021");
    expect(angel?.priceSignals[0]?.tier).toBe("supplier-published");
    expect(angel?.priceSignals[0]?.source.url).toContain("angelstarchandfood.com");
  });
});
