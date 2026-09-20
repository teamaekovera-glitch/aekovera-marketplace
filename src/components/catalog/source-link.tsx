import type { SourceRef, SourcedValue } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { UnknownField } from "./unknown-field";

function sourceTitle(source: SourceRef): string {
  return `Source: ${source.url} · retrieved ${source.retrievedAt}`;
}

/**
 * A claimed fact, linked to the page it was read from (claim-level
 * provenance, Rulebook D1). The value itself is the link.
 */
export function SourceLink({
  sourced,
  className,
  linkClassName,
}: {
  sourced: SourcedValue<string>;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <span data-provenance="sourced" className={className}>
      <a
        href={sourced.source.url}
        target="_blank"
        rel="noopener noreferrer"
        title={sourceTitle(sourced.source)}
        data-source-link
        className={cn(
          "underline decoration-border underline-offset-2 hover:decoration-accent",
          linkClassName
        )}
      >
        {sourced.value}
      </a>
    </span>
  );
}

/**
 * Citation link for claims whose value is not itself a link (lists,
 * price figures, certifications): the fact renders beside its source.
 */
export function SourceCitation({
  source,
  className,
}: {
  source: SourceRef;
  className?: string;
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sourceTitle(source)}
      data-provenance="sourced"
      data-source-link
      className={cn(
        "inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-accent",
        className
      )}
    >
      Source<span aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * Renders a sourced string fact, or the Unknown label when no source
 * exists (null) — the two states a displayed fact can be in.
 */
export function SourcedText({
  sourced,
  className,
}: {
  sourced: SourcedValue<string> | null;
  className?: string;
}) {
  if (!sourced) return <UnknownField className={className} />;
  return <SourceLink sourced={sourced} className={className} />;
}
