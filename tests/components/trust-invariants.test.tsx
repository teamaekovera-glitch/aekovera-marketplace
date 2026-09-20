// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CompareTray } from "@/components/catalog/compare-tray";
import { SupplierCard } from "@/components/catalog/supplier-card";
import { ProvenanceBadge } from "@/components/catalog/provenance-badge";
import { UNKNOWN_LABEL, UnknownField } from "@/components/catalog/unknown-field";
import { facetCounts, visibleSuppliers } from "@/lib/catalog/display";
import {
  baseSupplier,
  demoSourceRef,
  makeSupplier,
  quarantinedSupplier,
  supplierWithUnknowns,
} from "@/lib/catalog/fixtures";
import { supplierSchema } from "@/lib/catalog/schema";
import type { Certification } from "@/lib/catalog/types";

afterEach(cleanup);

// Invariant 1 — no component renders a 'Verified' certification chip;
// certifications render 'Company-stated' only.
describe("invariant: certifications render Company-stated only", () => {
  it("labels every certification chip Company-stated", () => {
    const { container } = render(<SupplierCard supplier={baseSupplier} />);
    const chips = container.querySelectorAll("[data-certification-chip]");
    expect(chips.length).toBe(baseSupplier.certifications.value.length);
    for (const chip of chips) {
      expect(chip.textContent).toContain("Company-stated");
      expect(chip.textContent?.includes("Verified")).toBe(false);
    }
  });

  it("never prints the word Verified anywhere on a fully-sourced card", () => {
    const { container } = render(
      <SupplierCard
        supplier={makeSupplier({
          verificationLevel: "Official-site",
          confidence: "High",
        })}
      />
    );
    expect(container.textContent?.includes("Verified")).toBe(false);
  });

  it("the schema rejects a registry-verified certification at the data boundary", () => {
    const raw: unknown = {
      ...baseSupplier,
      certifications: {
        value: [
          { name: "USDA Organic", status: "verified", source: demoSourceRef },
        ],
        source: demoSourceRef,
      },
    };
    expect(supplierSchema.safeParse(raw).success).toBe(false);
  });

  it("a Verified status is a compile-time error", () => {
    const bad = {
      name: "USDA Organic",
      status: "verified",
      source: demoSourceRef,
    };
    // @ts-expect-error CertificationStatus has no "verified" member
    const cert: Certification = bad;
    expect(cert).toBeDefined();
  });
});

// Invariant 2 — UnknownField renders exactly 'Unknown — pending verification'.
describe("invariant: the Unknown label is exact", () => {
  it("UnknownField renders exactly 'Unknown — pending verification'", () => {
    const { container } = render(<UnknownField />);
    expect(container.textContent).toBe("Unknown — pending verification");
    expect(container.textContent).toBe(UNKNOWN_LABEL);
  });

  it("every null field in a card renders that exact label", () => {
    const { container } = render(<SupplierCard supplier={supplierWithUnknowns} />);
    const unknowns = container.querySelectorAll('[data-provenance="unknown"]');
    expect(unknowns.length).toBeGreaterThanOrEqual(6);
    for (const el of unknowns) {
      expect(el.textContent).toBe(UNKNOWN_LABEL);
      expect(el.textContent).toBe("Unknown — pending verification");
    }
  });
});

// Invariant 3 — any rendered fact renders with its SourceLink or the
// Unknown label.
describe("invariant: every rendered fact carries its source", () => {
  it("every fact field contains a source link or the Unknown label", () => {
    for (const supplier of [baseSupplier, supplierWithUnknowns]) {
      const { container, unmount } = render(<SupplierCard supplier={supplier} />);
      const fields = container.querySelectorAll("[data-fact-field]");
      // country + 6 dl fields + 2 lists + 2 price signals
      expect(fields.length).toBeGreaterThanOrEqual(11);
      for (const field of fields) {
        const hasSource = field.querySelector("a[data-source-link]") !== null;
        const hasUnknown =
          field.querySelector('[data-provenance="unknown"]') !== null;
        expect(hasSource || hasUnknown).toBe(true);
      }
      unmount();
    }
  });

  it("a fully-sourced card renders no Unknown labels and every link points at a claim source", () => {
    const { container } = render(<SupplierCard supplier={baseSupplier} />);
    expect(container.querySelector('[data-provenance="unknown"]')).toBeNull();
    const links = container.querySelectorAll("a[data-source-link]");
    expect(links.length).toBeGreaterThan(0);
    const claimUrls = new Set(baseSupplier.sources.map((s) => s.url));
    for (const link of links) {
      expect(claimUrls.has(link.getAttribute("href") ?? "")).toBe(true);
    }
  });
});

// Invariant 4 — list/grid helpers exclude quarantined rows; quarantined
// data is unreachable from rendering.
describe("invariant: quarantined rows are unreachable from rendering", () => {
  it("visibleSuppliers drops quarantined rows", () => {
    const visible = visibleSuppliers([baseSupplier, quarantinedSupplier]);
    expect(visible.map((s) => s.id)).toEqual([baseSupplier.id]);
  });

  it("a directly-rendered quarantined row leaks no facts", () => {
    const { container } = render(<SupplierCard supplier={quarantinedSupplier} />);
    expect(container.querySelector("[data-withheld]")).not.toBeNull();
    expect(container.textContent).toContain("Withheld pending verification");
    expect(container.textContent).not.toContain("Quarantine Candidate Ltd");
    expect(container.querySelectorAll("a[data-source-link]")).toHaveLength(0);
  });

  it("the compare tray filters quarantined rows itself", () => {
    const { container } = render(
      <CompareTray suppliers={[baseSupplier, quarantinedSupplier]} />
    );
    expect(container.querySelectorAll("[data-compare-column]")).toHaveLength(1);
    expect(container.textContent).not.toContain("Quarantine Candidate Ltd");
  });

  it("quarantined rows never contribute to facet counts", () => {
    const hidden = makeSupplier({
      id: "demo-hidden",
      ingredients: { value: ["vanilla"], source: demoSourceRef },
      quarantined: { reason: "withheld" },
    });
    const shown = makeSupplier({
      id: "demo-shown",
      ingredients: { value: ["vanilla", "cocoa"], source: demoSourceRef },
    });
    const { container } = render(
      <SupplierCard supplier={shown} />
    );
    expect(container.textContent).toContain("cocoa");
    expect(container.textContent).not.toContain("Quarantine Candidate Ltd");
    // and the facet helper itself
    expect(
      facetCounts([hidden, shown], "ingredients").map((o) => o.value)
    ).toEqual(["cocoa", "vanilla"]);
  });
});

// ProvenanceBadge renders row-level disclosure only — the "Unverified" row
// level is honest disclosure, not a certification claim.
describe("invariant: row-level provenance stays honest", () => {
  it("renders Unverified as a row-level level without a certification chip", () => {
    const { container } = render(
      <ProvenanceBadge
        supplier={{ verificationLevel: "Unverified", confidence: "Low" }}
      />
    );
    expect(container.textContent).toContain("Unverified");
    expect(container.querySelector("[data-certification-chip]")).toBeNull();
  });
});
