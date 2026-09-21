// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryBrowser } from "@/components/browse/category-browser";
import { UNKNOWN_LABEL } from "@/components/catalog/unknown-field";
import ProvenancePage from "@/app/provenance/page";
import LandingPage from "@/app/page";
import CategoryPage from "@/app/categories/[slug]/page";
import { quarantinedCount } from "@/lib/catalog/display";
import { catalogSuppliers, regionCounts, regionalDatasets } from "@/lib/catalog/merge";
import { baseSupplier } from "@/lib/catalog/fixtures";
import type { Supplier } from "@/lib/catalog/types";
import {
  regionFacetOptions,
  regionIdByName,
  subtypeFacetOptions,
  suppliersInCategory,
  taxonomyCategoryBySlug,
  taxonomyStats,
  REGION_FACET_KEY,
  SUBTYPE_FACET_KEY,
  type BrowseFacetGroup,
} from "@/lib/taxonomy";

const rawRows = regionalDatasets.flatMap((dataset) => dataset.suppliers);

afterEach(cleanup);

/** Reads a StatStrip figure by its label (dt) -> adjacent dd. */
function statValue(label: string): string {
  const dt = screen.getByText(label);
  return dt.closest("div")?.querySelector("dd")?.textContent ?? "";
}

describe("landing page", () => {
  it("renders catalog counts computed from the dataset, not hardcoded", () => {
    render(<LandingPage />);
    const stats = taxonomyStats();
    expect(statValue("Suppliers listed")).toBe(String(catalogSuppliers.length));
    expect(statValue("Regions")).toBe(String(regionCounts.length));
    expect(statValue("Ingredient categories")).toBe(String(stats.categoryCount));
    expect(statValue("Taxonomy subtypes tracked")).toBe(String(stats.subtypeCount));
  });

  it("discloses the withheld-row count in the stats footnote", () => {
    render(<LandingPage />);
    const withheld = quarantinedCount(rawRows);
    expect(withheld).toBe(10);
    expect(screen.getByTestId("withheld-note").textContent).toContain(String(withheld));
  });

  it("offers six region entry points and all category entry links", () => {
    const { container } = render(<LandingPage />);
    const regionLinks = container.querySelectorAll('[data-slot="region-entry"]');
    expect(regionLinks).toHaveLength(regionCounts.length);
    for (const region of regionCounts) {
      expect(
        [...regionLinks].some(
          (a) => a.getAttribute("href") === `/suppliers?region=${region.regionId}`,
        ),
        `missing region entry for ${region.regionId}`,
      ).toBe(true);
    }
    const categoryLinks = container.querySelectorAll('[data-slot="category-entry"]');
    expect(categoryLinks).toHaveLength(33);
  });
});

describe("category page", () => {
  const slug = "cocoa-coffee-tea";
  const category = taxonomyCategoryBySlug(slug);
  if (!category) throw new Error(`missing taxonomy category: ${slug}`);
  const scoped = suppliersInCategory(catalogSuppliers, category);

  it("renders counts from the dataset and no quarantined rows", async () => {
    const { container } = render(await CategoryPage({ params: Promise.resolve({ slug }) }));
    expect(screen.getByTestId("category-summary").textContent).toContain(
      `${scoped.length} suppliers listed`,
    );
    expect(screen.getByTestId("result-count").textContent).toBe(
      `Showing ${scoped.length} of ${scoped.length} suppliers`,
    );
    for (const supplier of rawRows) {
      if (supplier.quarantined) {
        expect(container.textContent).not.toContain(supplier.name.value);
      }
    }
  });

  it("discloses the pending-[C] subtype count", async () => {
    const pending = category.subtypes.filter((s) => !s.verified).length;
    const { container } = render(await CategoryPage({ params: Promise.resolve({ slug }) }));
    const note = container.querySelector('[data-testid="pending-subtypes-note"]');
    if (pending > 0) {
      expect(note?.textContent).toContain(String(pending));
    } else {
      expect(note).toBeNull();
    }
  });

  it("renders no facet option for any [C] subtype", async () => {
    const { container } = render(await CategoryPage({ params: Promise.resolve({ slug }) }));
    const pendingNames = category.subtypes.filter((s) => !s.verified).map((s) => s.name);
    const renderedOptions = [
      ...container.querySelectorAll('[data-slot="facet-group"] label span'),
    ].map((el) => el.textContent);
    for (const name of pendingNames) {
      expect(renderedOptions).not.toContain(name);
    }
  });

  it("404s on an unknown slug", async () => {
    await expect(
      CategoryPage({ params: Promise.resolve({ slug: "not-a-real-category" }) }),
    ).rejects.toThrow();
  });
});

describe("category browser interactions", () => {
  const slug = "cocoa-coffee-tea";
  const category = taxonomyCategoryBySlug(slug);
  if (!category) throw new Error(`missing taxonomy category: ${slug}`);
  const scoped = suppliersInCategory(catalogSuppliers, category);
  const facetGroups: BrowseFacetGroup[] = [
    {
      key: SUBTYPE_FACET_KEY,
      label: "Ingredient subtypes (verified)",
      options: subtypeFacetOptions(catalogSuppliers, category),
    },
    {
      key: REGION_FACET_KEY,
      label: "Region",
      options: regionFacetOptions(scoped, regionCounts),
    },
  ];

  it("narrows results when a region facet is selected and restores on clear", () => {
    render(
      <CategoryBrowser
        suppliers={scoped}
        facetGroups={facetGroups}
        regionLabels={regionIdByName(regionCounts)}
        pendingSubtypeCount={0}
      />,
    );
    const regionGroup = facetGroups[1];
    if (!regionGroup) throw new Error("region facet group missing");
    const firstRegion = regionGroup.options[0];
    if (!firstRegion) throw new Error("no region facet options available");
    const checkbox = screen.getByRole("checkbox", { name: new RegExp(firstRegion.value) });
    fireEvent.click(checkbox);
    expect(screen.getByTestId("result-count").textContent).toBe(
      `Showing ${firstRegion.count} of ${scoped.length} suppliers`,
    );
    fireEvent.click(checkbox);
    expect(screen.getByTestId("result-count").textContent).toBe(
      `Showing ${scoped.length} of ${scoped.length} suppliers`,
    );
  });

  it("shows the filtered-empty state and clears back to results", () => {
    const groups: BrowseFacetGroup[] = [
      {
        key: SUBTYPE_FACET_KEY,
        label: "Ingredient subtypes (verified)",
        options: [{ value: "no-such-subtype-anywhere", count: 0 }],
      },
    ];
    render(
      <CategoryBrowser
        suppliers={[baseSupplier as Supplier]}
        facetGroups={groups}
        pendingSubtypeCount={0}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByTestId("filter-empty-state")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.queryByTestId("filter-empty-state")).toBeNull();
    expect(screen.getByTestId("result-count").textContent).toBe("Showing 1 of 1 suppliers");
  });

  it("renders the empty state for a category with no listed suppliers", () => {
    render(<CategoryBrowser suppliers={[]} facetGroups={[]} pendingSubtypeCount={3} />);
    expect(screen.getByTestId("category-empty-state")).toBeTruthy();
  });
});

describe("provenance page", () => {
  it("documents the evidence tiers and exact unknown label", () => {
    render(<ProvenancePage />);
    for (const tier of ["T1", "T2", "T3", "T4", "G", "F"]) {
      expect(screen.getByText(tier)).toBeTruthy();
    }
    expect(screen.getByTestId("unknown-label").textContent).toBe(UNKNOWN_LABEL);
  });

  it("discloses computed quarantine and taxonomy-backlog figures", () => {
    render(<ProvenancePage />);
    const withheld = quarantinedCount(rawRows);
    expect(
      screen.getByText(/withheld from this catalog pending verification/).textContent,
    ).toContain(String(withheld));
    const stats = taxonomyStats();
    const summary = screen.getByTestId("taxonomy-summary").textContent;
    expect(summary).toContain(`${stats.categoryCount}-category`);
    expect(summary).toContain(String(stats.pendingSubtypeCount));
  });
});
