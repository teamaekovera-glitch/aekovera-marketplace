import { cn } from "@/lib/cn";
import type { FacetOption } from "@/lib/catalog/display";

export interface FacetGroup {
  key: string;
  label: string;
  options: readonly FacetOption[];
}

/** Vertical filter groups — the parent owns selection state. */
export function FacetSidebar({
  groups,
  selected = {},
  onToggle,
  className,
}: {
  groups: readonly FacetGroup[];
  /** Selected values per group key. */
  selected?: Readonly<Record<string, ReadonlySet<string>>>;
  onToggle?: (groupKey: string, value: string) => void;
  className?: string;
}) {
  if (groups.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No filters available.
      </p>
    );
  }
  return (
    <nav
      data-slot="facet-sidebar"
      aria-label="Catalog filters"
      className={cn("flex flex-col gap-5", className)}
    >
      {groups.map((group) => (
        <FacetGroupBlock
          key={group.key}
          group={group}
          selected={selected[group.key]}
          onToggle={onToggle}
        />
      ))}
    </nav>
  );
}

function FacetGroupBlock({
  group,
  selected,
  onToggle,
}: {
  group: FacetGroup;
  selected?: ReadonlySet<string>;
  onToggle?: (groupKey: string, value: string) => void;
}) {
  return (
    <section data-slot="facet-group">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {group.label}
      </h3>
      {group.options.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No options.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {group.options.map((option) => {
            const checked = selected?.has(option.value) ?? false;
            const inputId = `facet-${group.key}-${facetSlug(option.value)}`;
            return (
              <li key={option.value} className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle?.(group.key, option.value)}
                  className="size-4 rounded border-input accent-accent"
                />
                <label
                  htmlFor={inputId}
                  className="flex min-w-0 flex-1 cursor-pointer items-baseline gap-1.5 text-sm"
                >
                  <span className="truncate">{option.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({option.count})
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Stable DOM id from a facet value (values may contain spaces or slashes). */
function facetSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
