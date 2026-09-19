import { z, type ZodType } from "zod";
import type {
  AssociationLead,
  CatalogDataset,
  Certification,
  Confidence,
  PriceSignal,
  Quarantine,
  RegionCount,
  RegionalDataset,
  RegionPriceSignal,
  SourcedValue,
  Supplier,
  VerificationLevel,
} from "./types";

/** ISO calendar date (YYYY-MM-DD) — Rulebook D12. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)")
  .refine((v) => !Number.isNaN(Date.parse(v)), "must be a real calendar date");

const kebabId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case");

const sourceRefSchema: ZodType<{
  url: string;
  retrievedAt: string;
  note?: string;
}> = z
  .object({
    url: z.string().url(),
    retrievedAt: isoDate,
    note: z.string().min(1).optional(),
  })
  .strict();

/** Wraps a value schema with its claim-level source (Rulebook D1). */
function sourced<T extends z.ZodTypeAny>(valueSchema: T) {
  return z
    .object({
      value: valueSchema,
      source: sourceRefSchema,
    })
    .strict();
}

const priceTierSchema: ZodType<"supplier-published" | "marketplace-listed" | "quote-only"> =
  z.enum(["supplier-published", "marketplace-listed", "quote-only"]);

const priceSignalShape = {
  tier: priceTierSchema,
  value: z.string().min(1).optional(),
  staleness: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
  source: sourceRefSchema,
} as const satisfies Record<string, z.ZodTypeAny>;

const priceSignalSchema: ZodType<PriceSignal> = z.object(priceSignalShape).strict();

const certificationSchema: ZodType<Certification> = z
  .object({
    name: z.string().min(1),
    status: z.literal("company-stated"),
    source: sourceRefSchema,
  })
  .strict();

const quarantineSchema: ZodType<Quarantine> = z
  .object({
    reason: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

const verificationLevelSchema: ZodType<VerificationLevel> = z.enum([
  "Official-site",
  "Official-site + association context",
  "Registry",
  "Unverified",
]);

const confidenceSchema: ZodType<Confidence> = z.enum([
  "High",
  "Medium-High",
  "Medium",
  "Low",
]);

export const supplierSchema: ZodType<Supplier> = z
  .object({
    id: kebabId,
    regionId: kebabId,
    name: sourced(z.string().min(1)),
    website: sourced(z.string().url()),
    hq: sourced(z.string().min(1)).nullable(),
    country: sourced(z.string().min(1)),
    regionsServed: sourced(z.string().min(1)).nullable(),
    categories: sourced(z.array(z.string().min(1)).min(1)),
    ingredients: sourced(z.array(z.string().min(1)).min(1)),
    type: sourced(z.string().min(1)).nullable(),
    certifications: sourced(z.array(certificationSchema)),
    moq: sourced(z.string().min(1)).nullable(),
    samplePolicy: sourced(z.string().min(1)).nullable(),
    priceSignals: z.array(priceSignalSchema).min(1),
    capacity: sourced(z.string().min(1)).nullable(),
    reviewPresence: sourced(z.string().min(1)).nullable(),
    verificationLevel: verificationLevelSchema,
    confidence: confidenceSchema,
    note: z.string().min(1).optional(),
    quarantined: quarantineSchema.optional(),
    sources: z.array(sourceRefSchema).min(1),
  })
  .strict();

const regionPriceSignalSchema: ZodType<RegionPriceSignal> = z
  .object({ ...priceSignalShape, ingredient: z.string().min(1) })
  .strict();

const associationLeadSchema: ZodType<AssociationLead> = z
  .object({
    source: sourceRefSchema,
    note: z.string().min(1),
    companies: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const regionalDatasetSchema: ZodType<RegionalDataset> = z
  .object({
    schemaVersion: z.literal(1),
    regionId: kebabId,
    region: z.string().min(1),
    retrieved: isoDate,
    documentArtifact: z.string().min(1).optional(),
    documentPath: z.string().min(1).optional(),
    methodology: z.string().min(1).optional(),
    suppliers: z.array(supplierSchema).min(1),
    priceSignals: z.array(regionPriceSignalSchema).optional(),
    coverageGaps: z.array(z.string().min(1)).optional(),
    associationLeads: associationLeadSchema.optional(),
  })
  .strict();

export const regionCountSchema: ZodType<RegionCount> = z
  .object({
    regionId: kebabId,
    region: z.string().min(1),
    supplierCount: z.number().int().positive(),
  })
  .strict();

export const catalogDatasetSchema: ZodType<CatalogDataset> = z
  .object({
    suppliers: z.array(supplierSchema),
    regionCounts: z.array(regionCountSchema).min(1),
    totalCount: z.number().int().nonnegative(),
  })
  .strict();
