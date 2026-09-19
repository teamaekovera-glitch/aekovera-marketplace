import type { SourceRef } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { SourceLink } from "./source-link";

export interface StatItem {
  /** Unique within one strip — used as the row key. */
  label: string;
  value: string | number;
  /** Present when the figure itself is a claim read from a source. */
  source?: SourceRef;
}

/** Horizontal strip of headline figures; sourced figures link to their claim source. */
export function StatStrip({
  stats,
  className,
}: {
  stats: readonly StatItem[];
  className?: string;
}) {
  if (stats.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No stats to display.
      </p>
    );
  }
  return (
    <dl
      data-slot="stat-strip"
      className={cn("flex flex-wrap gap-x-8 gap-y-3", className)}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </dt>
          <dd className="mt-0.5 text-lg font-semibold">
            {stat.source ? (
              <SourceLink
                sourced={{ value: String(stat.value), source: stat.source }}
                linkClassName="text-foreground no-underline hover:underline"
              />
            ) : (
              stat.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
