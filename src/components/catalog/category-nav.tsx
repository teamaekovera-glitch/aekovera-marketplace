import { cn } from "@/lib/cn";

export interface CategoryNavItem {
  value: string;
  count?: number;
}

/** Vertical category navigation — the parent owns the selected value. */
export function CategoryNav({
  categories,
  selected = null,
  onSelect,
  className,
}: {
  categories: readonly CategoryNavItem[];
  /** Currently selected value, or null for no selection ("all"). */
  selected?: string | null;
  onSelect?: (value: string) => void;
  className?: string;
}) {
  if (categories.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No categories yet.
      </p>
    );
  }
  return (
    <nav
      data-slot="category-nav"
      aria-label="Ingredient categories"
      className={cn("flex flex-col gap-1", className)}
    >
      {categories.map((category) => {
        const isSelected = category.value === selected;
        return (
          <button
            key={category.value}
            type="button"
            aria-current={isSelected ? "true" : undefined}
            onClick={() => onSelect?.(category.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
              isSelected
                ? "bg-accent/10 font-medium text-accent"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <span className="truncate">{category.value}</span>
            {category.count !== undefined ? (
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                {category.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
