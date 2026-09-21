import Link from "next/link";
import { cn } from "@/lib/cn";

import type { CategoryEntry } from "@/lib/taxonomy";

/**
 * The full 33-category taxonomy as crawlable links (the catalog CategoryNav is
 * a button-list for in-page filtering; this one navigates between category
 * pages, so real hrefs matter). Counts come from the live dataset.
 */
export function CategoryLinks({
  entries,
  activeSlug,
  className,
}: {
  entries: readonly CategoryEntry[];
  activeSlug?: string;
  className?: string;
}) {
  return (
    <nav data-slot="category-links" aria-label="Ingredient categories" className={cn(className)}>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/categories/${entry.slug}`}
              aria-current={activeSlug === entry.slug ? "page" : undefined}
              className={
                activeSlug === entry.slug
                  ? "inline-flex items-baseline gap-1.5 rounded-full border border-accent bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  : "inline-flex items-baseline gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
              }
            >
              <span>{entry.name}</span>
              <span className="tabular-nums text-muted-foreground">({entry.supplierCount})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
