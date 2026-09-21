/**
 * Search-first entry point for the catalog (spec F-01 landing). A plain GET
 * form to /suppliers — distinct from the controlled catalog SearchBar, which
 * is for the hydrated discovery surface. Zero client JavaScript: this works
 * before hydration and for crawlers.
 */
export function SearchEntryForm({ className }: { className?: string }) {
  return (
    <form
      action="/suppliers"
      method="get"
      role="search"
      data-slot="search-entry-form"
      className={
        className ??
        "flex w-full max-w-xl items-stretch overflow-hidden rounded-lg border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring"
      }
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search ingredient suppliers
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder={'Try "curcumin C3 Complex 95% curcuminoids"'}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="shrink-0 bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
        Search suppliers
      </button>
    </form>
  );
}
