import { cn } from "@/lib/cn";

/**
 * The one honest label for a field with no fetched source (Rulebook D4:
 * "we looked and found nothing" is Unknown, never a blank, zero, or an
 * inferred value). The label is fixed — it cannot be overridden or
 * restyled into something that reads as data.
 */
export const UNKNOWN_LABEL = "Unknown — pending verification";

export function UnknownField({ className }: { className?: string }) {
  return (
    <span
      data-provenance="unknown"
      className={cn("text-sm italic text-muted-foreground", className)}
    >
      {UNKNOWN_LABEL}
    </span>
  );
}
