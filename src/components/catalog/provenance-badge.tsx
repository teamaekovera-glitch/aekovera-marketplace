import { Badge } from "@/components/ui/badge";
import type { Supplier } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

/**
 * Row-level research provenance: how the row was verified and with what
 * evidence confidence (Rulebook D3). "Unverified" as a row-level level is
 * an honest disclosure — distinct from certification chips, which are
 * Company-stated only.
 */
export function ProvenanceBadge({
  supplier,
  className,
}: {
  supplier: Pick<Supplier, "verificationLevel" | "confidence">;
  className?: string;
}) {
  return (
    <span
      data-provenance="badge"
      className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
    >
      <Badge variant="secondary">{supplier.verificationLevel}</Badge>
      <Badge variant="outline">Confidence: {supplier.confidence}</Badge>
    </span>
  );
}
