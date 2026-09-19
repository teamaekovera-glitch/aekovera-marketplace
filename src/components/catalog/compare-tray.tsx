import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAX_COMPARE,
  visibleSuppliers,
} from "@/lib/catalog/display";
import type { Supplier } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { SourceCitation, SourceLink, SourcedText } from "./source-link";

/**
 * Side-by-side comparison of up to MAX_COMPARE suppliers. Quarantined rows
 * are filtered again here — defense in depth on top of the list helpers,
 * so a caller bug cannot leak a withheld row into the tray.
 */
export function CompareTray({
  suppliers,
  onRemove,
  className,
}: {
  suppliers: readonly Supplier[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  const visible = visibleSuppliers(suppliers).slice(0, MAX_COMPARE);

  if (visible.length === 0) {
    return (
      <p
        data-slot="compare-tray"
        className={cn("text-sm text-muted-foreground", className)}
      >
        No suppliers selected for comparison. Use Compare on a supplier card.
      </p>
    );
  }

  return (
    <section
      data-slot="compare-tray"
      aria-label="Supplier comparison"
      className={cn("rounded-lg border bg-card p-4", className)}
    >
      <h3 className="text-sm font-semibold">
        Comparing {visible.length} of max {MAX_COMPARE}
      </h3>
      <div
        className={cn(
          "mt-3 grid grid-cols-1 gap-3",
          visible.length >= 2 && "sm:grid-cols-2",
          visible.length >= 3 && "lg:grid-cols-3"
        )}
      >
        {visible.map((supplier) => (
          <div
            key={supplier.id}
            data-compare-column
            className="relative min-w-0 rounded-md border p-3"
          >
            {onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${supplier.name.value} from comparison`}
                onClick={() => onRemove(supplier.id)}
                className="absolute right-1 top-1 size-7"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            ) : null}
            <h4 className="pr-8 text-sm font-semibold leading-snug">
              <SourceLink
                sourced={supplier.name}
                linkClassName="text-foreground"
              />
            </h4>
            <dl className="mt-2 flex flex-col gap-1 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                  Country
                </dt>
                <dd className="min-w-0 truncate">
                  <SourcedText sourced={supplier.country} />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                  MOQ
                </dt>
                <dd className="min-w-0 truncate">
                  <SourcedText sourced={supplier.moq} />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                  Certifications
                </dt>
                <dd className="flex min-w-0 items-baseline gap-1">
                  <span className="truncate">
                    {supplier.certifications.value.length} · Company-stated
                  </span>
                  <SourceCitation source={supplier.certifications.source} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
