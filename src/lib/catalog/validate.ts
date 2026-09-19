import { regionalDatasetSchema } from "./schema";
import type { RegionCount, SourceRef, Supplier } from "./types";

/** One catalog file ready for validation. */
export interface CatalogFileInput {
  /** File name or repo-relative path; the basename identifies the region. */
  path: string;
  json: unknown;
}

export interface CatalogValidationIssue {
  file: string;
  supplierId?: string;
  message: string;
}

export interface CatalogValidationResult {
  valid: boolean;
  filesValidated: number;
  supplierCount: number;
  perRegionCounts: RegionCount[];
  issues: CatalogValidationIssue[];
}

/** All claim-level sources referenced by a row's displayed fields. */
function claimSources(supplier: Supplier): SourceRef[] {
  const sourced = [
    supplier.name,
    supplier.website,
    supplier.hq,
    supplier.country,
    supplier.regionsServed,
    supplier.categories,
    supplier.ingredients,
    supplier.type,
    supplier.certifications,
    supplier.moq,
    supplier.samplePolicy,
    supplier.capacity,
    supplier.reviewPresence,
  ];
  return [
    ...sourced.flatMap((field) => (field === null ? [] : [field.source])),
    ...supplier.certifications.value.flatMap((cert) => [cert.source]),
    ...supplier.priceSignals.map((signal) => signal.source),
  ];
}

function issueFor(file: string, supplierId: string | undefined, message: string): CatalogValidationIssue {
  return { file, supplierId, message };
}

/**
 * Validates regional catalog files against the canonical schema and the
 * provenance invariants: unique ids, region/file agreement, and every
 * claim-level source listed in the row's `sources`. Pure — no I/O.
 */
export function validateCatalogFiles(files: CatalogFileInput[]): CatalogValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      filesValidated: 0,
      supplierCount: 0,
      perRegionCounts: [],
      issues: [
        { file: "(none)", message: "no catalog files found under src/data/suppliers" },
      ],
    };
  }

  const issues: CatalogValidationIssue[] = [];
  const perRegionCounts: RegionCount[] = [];
  const idOwner = new Map<string, string>();
  let supplierCount = 0;

  for (const file of files) {
    const parsed = regionalDatasetSchema.safeParse(file.json);
    if (!parsed.success) {
      for (const zodIssue of parsed.error.issues) {
        const path = zodIssue.path;
        const supplierIndex = path[0] === "suppliers" && typeof path[1] === "number" ? path[1] : undefined;
        const raw = (file.json as { suppliers?: unknown[] } | null)?.suppliers?.[supplierIndex ?? -1];
        const supplierId =
          supplierIndex !== undefined && raw !== null && typeof raw === "object" && "id" in raw
            ? String((raw as { id: unknown }).id)
            : supplierIndex !== undefined
              ? `suppliers[${supplierIndex}]`
              : undefined;
        issues.push(
          issueFor(file.path, supplierId, `${path.join(".") || "(root)"}: ${zodIssue.message}`)
        );
      }
      continue;
    }

    const dataset = parsed.data;
    const fileName = (file.path.split(/[\\/]/).pop() ?? file.path).replace(/\.json$/, "");
    if (dataset.regionId !== fileName) {
      issues.push(
        issueFor(file.path, undefined, `regionId "${dataset.regionId}" must match file name "${fileName}"`)
      );
    }

    for (const supplier of dataset.suppliers) {
      supplierCount += 1;

      const owner = idOwner.get(supplier.id);
      if (owner !== undefined) {
        issues.push(issueFor(file.path, supplier.id, `duplicate id (first seen in ${owner})`));
      } else {
        idOwner.set(supplier.id, file.path);
      }

      if (!supplier.id.startsWith(`${dataset.regionId}-`)) {
        issues.push(
          issueFor(file.path, supplier.id, `id must start with region prefix "${dataset.regionId}-"`)
        );
      }

      const listedUrls = new Set(supplier.sources.map((source) => source.url));
      for (const claim of claimSources(supplier)) {
        if (!listedUrls.has(claim.url)) {
          issues.push(
            issueFor(
              file.path,
              supplier.id,
              `claim source ${claim.url} is not listed in the row's sources[]`
            )
          );
        }
      }
    }

    perRegionCounts.push({
      regionId: dataset.regionId,
      region: dataset.region,
      supplierCount: dataset.suppliers.length,
    });
  }

  return {
    valid: issues.length === 0,
    filesValidated: files.length,
    supplierCount,
    perRegionCounts,
    issues,
  };
}
