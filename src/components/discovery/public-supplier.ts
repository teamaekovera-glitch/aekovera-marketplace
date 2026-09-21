import { catalogSuppliers } from "@/lib/catalog/merge";
import type { Supplier } from "@/lib/catalog/types";

/**
 * The profile-route visibility gate. `catalogSuppliers` already excludes
 * quarantined rows at the data layer; the explicit re-check is defense in
 * depth — a withheld row has no route even if the export contract drifts.
 * Returns null for unknown and withheld ids alike; the route renders
 * notFound() on null.
 */
export function getPublicSupplier(id: string): Supplier | null {
  const supplier = catalogSuppliers.find((row) => row.id === id);
  if (!supplier || supplier.quarantined) return null;
  return supplier;
}
