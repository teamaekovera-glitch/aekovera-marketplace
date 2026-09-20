import type { SourceRef } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

export interface EvidenceClaim {
  label: string;
  source: SourceRef;
}

/**
 * Per-claim evidence list: every claim's URL, retrieval date, and source
 * note. The claim audit trail for a card, in one disclosure.
 */
export function EvidenceDrawer({
  claims,
  title = "Evidence",
  className,
}: {
  claims: readonly EvidenceClaim[];
  title?: string;
  className?: string;
}) {
  return (
    <details
      data-slot="evidence-drawer"
      className={cn("rounded-md border bg-background px-3 py-2", className)}
    >
      <summary className="cursor-pointer select-none text-sm font-medium">
        {title} ({claims.length})
      </summary>
      {claims.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No evidence recorded.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {claims.map((claim) => (
            <li
              key={`${claim.label}-${claim.source.url}`}
              className="text-sm leading-snug"
            >
              <span className="font-medium">{claim.label}</span>
              {" — "}
              <a
                href={claim.source.url}
                target="_blank"
                rel="noopener noreferrer"
                data-source-link
                data-provenance="sourced"
                className="break-all underline underline-offset-2 hover:text-accent"
              >
                {claim.source.url}
              </a>
              <span className="text-xs text-muted-foreground">
                {" · retrieved "}
                {claim.source.retrievedAt}
                {claim.source.note ? ` · ${claim.source.note}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
