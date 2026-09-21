// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SupplierDiscovery } from "@/components/discovery/supplier-discovery";
import SuppliersPage from "@/app/suppliers/page";
import {
  buildDiscoveryRecords,
  DiscoverySearchClient,
} from "@/components/discovery/search-client";
import { RESULTS_CAP } from "@/components/discovery/search-results";
import { catalogSuppliers, regionCounts } from "@/lib/catalog/merge";
import type { CatalogSearchResponse } from "@/lib/search/catalog-types";

afterEach(cleanup);

/**
 * The discovery page renders ~1,300 facet checkboxes; RTL's getByLabelText
 * reads jsdom's `.labels` getter per labelable element, and each getter walks
 * the entire tree with unindexed id lookups — quadratic, minutes per query.
 * These helpers use attribute and label-text matching instead, which stay
 * linear and avoid the getter entirely.
 */
function searchInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    'input[aria-label="Search suppliers"]',
  );
  if (!input) throw new Error("search input not found");
  return input;
}

function facetCheckbox(container: HTMLElement, text: string): HTMLInputElement {
  const label = Array.from(container.querySelectorAll("label")).find((node) =>
    node.textContent?.trim().startsWith(text),
  );
  if (!label) throw new Error(`no facet label starting with "${text}"`);
  const input =
    label.querySelector("input") ??
    (label.htmlFor ? document.getElementById(label.htmlFor) : null);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`no checkbox for facet "${text}"`);
  }
  return input;
}

/** The same construction the /suppliers page performs, for test props. */
async function pageProps() {
  const client = new DiscoverySearchClient(
    buildDiscoveryRecords(catalogSuppliers, regionCounts),
    regionCounts,
  );
  const initialResponse: CatalogSearchResponse = await client.searchCatalog("", {});
  return {
    suppliers: catalogSuppliers,
    regionCounts,
    initialResponse,
  };
}

/** A client over the same records, for expected values straight from the index. */
function expectedClient() {
  return new DiscoverySearchClient(
    buildDiscoveryRecords(catalogSuppliers, regionCounts),
    regionCounts,
  );
}

describe("SupplierDiscovery — wired to the real index", () => {
  it("renders browse mode over the merged catalog, capped with an explicit note", async () => {
    const props = await pageProps();
    const { container } = render(<SupplierDiscovery {...props} />);

    const count = container.querySelector("[data-result-count]");
    expect(count?.textContent).toContain(`${catalogSuppliers.length} suppliers`);

    const cards = container.querySelectorAll('[data-slot="supplier-card"]');
    expect(cards.length).toBe(Math.min(RESULTS_CAP, catalogSuppliers.length));
    expect(container.querySelector("[data-truncated-note]")?.textContent).toContain(
      `Showing the first ${RESULTS_CAP} of ${catalogSuppliers.length}`
    );
  });

  it("updates results from the real index when a query is typed", async () => {
    const props = await pageProps();
    const { container } = render(<SupplierDiscovery {...props} />);

    const expected = await expectedClient().searchCatalog("coffee", {});
    expect(expected.totalHits).toBeGreaterThan(0);

    fireEvent.change(searchInput(container), {
      target: { value: "coffee" },
    });

    await waitFor(() => {
      expect(container.querySelector("[data-result-count]")?.textContent).toContain(
        `${expected.totalHits} suppliers`
      );
    });
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      "coffee"
    );
  });

  it("filters through facet toggles using the search client's filter semantics", async () => {
    const props = await pageProps();
    const { container } = render(<SupplierDiscovery {...props} />);

    const seaCount =
      props.initialResponse.facetCounts.region.find((r) => r.value === "Southeast Asia")
        ?.count ?? -1;
    expect(seaCount).toBe(44); // dataset-level truth from the merge contract

    fireEvent.click(facetCheckbox(container, "Southeast Asia"));

    const expected = await expectedClient().searchCatalog("", {
      regions: ["Southeast Asia"],
    });
    await waitFor(() => {
      expect(container.querySelector("[data-result-count]")?.textContent).toContain(
        `${expected.totalHits} suppliers`
      );
    });
    // Toggling a second region in the same group widens the set (OR within group).
    fireEvent.click(facetCheckbox(container, "US and Canada"));
    const union = await expectedClient().searchCatalog("", {
      regions: ["Southeast Asia", "US and Canada"],
    });
    await waitFor(() => {
      expect(container.querySelector("[data-result-count]")?.textContent).toContain(
        `${union.totalHits} suppliers`
      );
    });
    expect(union.totalHits).toBeGreaterThan(expected.totalHits);
  });

  it("shows the explained empty state and recovers on clear", async () => {
    const props = await pageProps();
    const { container } = render(<SupplierDiscovery {...props} />);

    const expected = await expectedClient().searchCatalog("zzqqxx", {});
    expect(expected.totalHits).toBe(0);

    fireEvent.change(searchInput(container), {
      target: { value: "zzqqxx" },
    });

    const empty = await waitFor(() => {
      const node = container.querySelector('[data-slot="search-empty"]');
      expect(node).toBeTruthy();
      return node as HTMLElement;
    });
    expect(empty.textContent).toContain("No suppliers match your search.");
    expect(empty.textContent).toContain("zzqqxx");

    fireEvent.click(screen.getByRole("button", { name: "Clear search and filters" }));
    await waitFor(() => {
      expect(container.querySelector('[data-slot="search-empty"]')).toBeNull();
    });
    const input = searchInput(container);
    expect(input.value).toBe("");
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${catalogSuppliers.length} suppliers`
    );
  });
});

describe("SupplierDiscovery — compare tray", () => {
  it("selects up to MAX_COMPARE suppliers and removes them", async () => {
    const props = await pageProps();
    const { container } = render(<SupplierDiscovery {...props} />);

    const compareButtons = () =>
      Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[data-slot="supplier-card"] button[aria-pressed="false"]'
        )
      ).filter((button) => button.textContent === "Compare");

    // Fill the tray to the cap.
    const targets = compareButtons().slice(0, 3);
    expect(targets.length).toBe(3);
    for (const button of targets) fireEvent.click(button);

    const tray = await waitFor(() => {
      const node = container.querySelector('[data-slot="compare-tray"]');
      expect(node).toBeTruthy();
      return node as HTMLElement;
    });
    expect(tray.textContent).toContain("Comparing 3 of max 3");

    // A fourth selection is refused, not silently swapped.
    const fourth = compareButtons()[0];
    if (!fourth) throw new Error("expected an unselected Compare button");
    fireEvent.click(fourth);
    expect(
      container.querySelector('[data-slot="compare-tray"]')?.textContent
    ).toContain("Comparing 3 of max 3");

    // Remove from the tray restores capacity.
    const removeButton = container.querySelector<HTMLButtonElement>(
      '[data-slot="compare-tray"] button[aria-label^="Remove"]'
    );
    if (!removeButton) throw new Error("expected a Remove button in the tray");
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(
        container.querySelector('[data-slot="compare-tray"]')?.textContent
      ).toContain("Comparing 2 of max 3");
    });

    // Clear comparison empties the dock entirely.
    // (querySelector instead of getByRole — RTL's name matching on this
    // 13k-element tree triggers the same jsdom label walk as getByLabelText,
    // a minutes-long quadratic stall; exact-text matching is equivalent here.)
    const clearButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Clear comparison"
    );
    if (!clearButton) throw new Error("Clear comparison button not found");
    fireEvent.click(clearButton);
    await waitFor(() => {
      expect(container.querySelector('[data-slot="compare-dock"]')).toBeNull();
    });
  });
});

describe("SupplierDiscovery — URL param seeding (landing deep-links)", () => {
  it("seeds the keyword from initialQuery so ?q= deep-links filter results", async () => {
    const expected = await expectedClient().searchCatalog("vanilla", {});
    expect(expected.totalHits).toBeGreaterThan(0);
    expect(expected.totalHits).toBeLessThan(catalogSuppliers.length);

    const client = new DiscoverySearchClient(
      buildDiscoveryRecords(catalogSuppliers, regionCounts),
      regionCounts,
    );
    const initialResponse = await client.searchCatalog("vanilla", {});
    const { container } = render(
      <SupplierDiscovery
        suppliers={catalogSuppliers}
        regionCounts={regionCounts}
        initialResponse={initialResponse}
        initialQuery="vanilla"
      />
    );

    // The controlled search bar reflects the seeded query…
    expect(searchInput(container).value).toBe("vanilla");
    // …and the first paint shows the filtered set, not browse mode.
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${expected.totalHits} suppliers`
    );
  });

  it("preselects the region facet from initialRegions so ?region= deep-links filter", async () => {
    const client = new DiscoverySearchClient(
      buildDiscoveryRecords(catalogSuppliers, regionCounts),
      regionCounts,
    );
    const initialResponse = await client.searchCatalog("", {
      regions: ["Southeast Asia"],
    });
    expect(initialResponse.totalHits).toBe(44); // dataset-level SEA count

    const { container } = render(
      <SupplierDiscovery
        suppliers={catalogSuppliers}
        regionCounts={regionCounts}
        initialResponse={initialResponse}
        initialRegions={["Southeast Asia"]}
      />
    );

    expect(facetCheckbox(container, "Southeast Asia").checked).toBe(true);
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${initialResponse.totalHits} suppliers`
    );
  });
});

describe("SuppliersPage — URL param wiring (the landing's GET deep-links)", () => {
  it("reads q and region params and seeds the discovery surface", async () => {
    const expected = await expectedClient().searchCatalog("vanilla", {
      regions: ["Southeast Asia"],
    });

    const ui = await SuppliersPage({
      searchParams: Promise.resolve({ q: "vanilla", region: "southeast-asia" }),
    });
    const { container } = render(ui);

    expect(searchInput(container).value).toBe("vanilla");
    expect(facetCheckbox(container, "Southeast Asia").checked).toBe(true);
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${expected.totalHits} suppliers`
    );
  });

  it("degrades an unknown regionId to browse mode instead of a broken facet", async () => {
    const ui = await SuppliersPage({
      searchParams: Promise.resolve({ region: "atlantis" }),
    });
    const { container } = render(ui);

    expect(searchInput(container).value).toBe("");
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${catalogSuppliers.length} suppliers`
    );
    expect(facetCheckbox(container, "Southeast Asia").checked).toBe(false);
  });

  it("renders browse mode when no params are present", async () => {
    const ui = await SuppliersPage({ searchParams: Promise.resolve({}) });
    const { container } = render(ui);

    expect(searchInput(container).value).toBe("");
    expect(container.querySelector("[data-result-count]")?.textContent).toContain(
      `${catalogSuppliers.length} suppliers`
    );
  });
});
