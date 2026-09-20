import type {
  Certification,
  PriceSignal,
  SourceRef,
  SourcedValue,
  Supplier,
} from "./types";

/**
 * Mock fixtures for component tests and the /dev/components preview.
 * Every fixture satisfies the strict supplier schema (asserted in tests) —
 * keep new variants schema-valid.
 */

export const demoSourceRef: SourceRef = {
  url: "https://example.com/demo-supplier",
  retrievedAt: "2026-09-01",
  note: "Fixture source — not a real claim",
};

function sourced<T>(value: T, source: SourceRef = demoSourceRef): SourcedValue<T> {
  return { value, source };
}

const demoCertification: Certification = {
  name: "ISO 9001:2015",
  status: "company-stated",
  source: demoSourceRef,
};

const quoteOnlySignal: PriceSignal = { tier: "quote-only", source: demoSourceRef };

const supplierPublishedSignal: PriceSignal = {
  tier: "supplier-published",
  value: "USD 3,350.00/MT, FOB Jakarta",
  staleness: "as of Q2 2026",
  source: demoSourceRef,
};

/** Fully-sourced baseline row; override fields to shape variants. */
export const baseSupplier: Supplier = {
  id: "demo-0001",
  regionId: "demo-region",
  name: sourced("Demo Supplier Co."),
  website: sourced("https://example.com/demo-supplier"),
  hq: sourced("Demo City, Demo Province"),
  country: sourced("Demo Country"),
  regionsServed: sourced("Worldwide export"),
  categories: sourced(["coffee", "spices"]),
  ingredients: sourced(["robusta green coffee", "black pepper"]),
  type: sourced("manufacturer / exporter"),
  certifications: sourced([demoCertification]),
  moq: sourced("1 MT"),
  samplePolicy: sourced("Samples available on request"),
  priceSignals: [quoteOnlySignal, supplierPublishedSignal],
  capacity: sourced("12,000 MT/year"),
  reviewPresence: sourced("Listed in 2 industry directories"),
  verificationLevel: "Official-site",
  confidence: "High",
  sources: [demoSourceRef],
};

export function makeSupplier(overrides: Partial<Supplier> = {}): Supplier {
  return { ...baseSupplier, ...overrides };
}

/** A row whose unfetched fields are recorded as null (Unknown), not blank. */
export const supplierWithUnknowns: Supplier = makeSupplier({
  id: "demo-0003",
  name: sourced("Sparse Evidence Trading"),
  hq: null,
  regionsServed: null,
  type: null,
  moq: null,
  samplePolicy: null,
  capacity: null,
  reviewPresence: null,
  certifications: sourced([]),
  verificationLevel: "Unverified",
  confidence: "Low",
});

/** A row withheld pending verification — excluded from lists by design. */
export const quarantinedSupplier: Supplier = makeSupplier({
  id: "demo-0004",
  name: sourced("Quarantine Candidate Ltd"),
  quarantined: {
    reason: "Website unreachable during URL audit; row details could not be re-confirmed",
    note: "Withheld pending re-verification",
  },
});

export const unverifiedSupplier: Supplier = makeSupplier({
  id: "demo-0005",
  verificationLevel: "Unverified",
  confidence: "Low",
});
