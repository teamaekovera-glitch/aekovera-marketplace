import { describe, expect, it } from "vitest";
import { supplierSchema } from "@/lib/catalog/schema";
import {
  baseSupplier,
  quarantinedSupplier,
  supplierWithUnknowns,
  unverifiedSupplier,
} from "@/lib/catalog/fixtures";

describe("catalog fixtures", () => {
  it.each([
    ["baseSupplier", baseSupplier],
    ["supplierWithUnknowns", supplierWithUnknowns],
    ["quarantinedSupplier", quarantinedSupplier],
    ["unverifiedSupplier", unverifiedSupplier],
  ])("%s satisfies the strict supplier schema", (_name, supplier) => {
    const result = supplierSchema.safeParse(supplier);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      );
    }
  });
});
