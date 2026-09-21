// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SupplierProfile, profileClaims } from "@/components/discovery/supplier-profile";
import { UNKNOWN_LABEL } from "@/components/catalog/unknown-field";
import { certificationChipLabel } from "@/lib/catalog/display";
import { catalogSuppliers } from "@/lib/catalog/merge";
import {
  baseSupplier,
  makeSupplier,
  supplierWithUnknowns,
} from "@/lib/catalog/fixtures";

afterEach(cleanup);

describe("SupplierProfile — trust invariants", () => {
  it("labels every certification chip Company-stated, never Verified", () => {
    const { container } = render(<SupplierProfile supplier={baseSupplier} />);
    const chips = container.querySelectorAll("[data-certification-chip]");
    expect(chips.length).toBe(baseSupplier.certifications.value.length);
    for (const chip of chips) {
      expect(chip.textContent).toContain("Company-stated");
      expect(chip.textContent?.includes("Verified")).toBe(false);
    }
    expect(container.textContent?.includes("Verified")).toBe(false);
  });

  it("renders every unsourced field with the exact Unknown label", () => {
    const { container } = render(<SupplierProfile supplier={supplierWithUnknowns} />);
    const unknowns = container.querySelectorAll('[data-provenance="unknown"]');
    // hq, type, regionsServed, reviewPresence, moq, samplePolicy, capacity — 7 nulls.
    expect(unknowns.length).toBe(7);
    for (const node of unknowns) {
      expect(node.textContent).toBe(UNKNOWN_LABEL);
    }
  });

  it("renders the empty-certification state honestly", () => {
    const { container } = render(<SupplierProfile supplier={supplierWithUnknowns} />);
    expect(container.textContent).toContain("None listed on the reviewed page.");
    expect(container.querySelectorAll("[data-certification-chip]").length).toBe(0);
  });

  it("carries row-level verification and confidence without implying claim verification", () => {
    const { container } = render(
      <SupplierProfile
        supplier={makeSupplier({ verificationLevel: "Unverified", confidence: "Low" })}
      />
    );
    const badge = container.querySelector('[data-provenance="badge"]');
    expect(badge?.textContent).toContain("Unverified"); // honest row-level disclosure
    expect(badge?.textContent).toContain("Confidence: Low");
    // Certification chips remain Company-stated regardless of row level.
    for (const chip of container.querySelectorAll("[data-certification-chip]")) {
      expect(chip.textContent).toContain(certificationChipLabel("company-stated"));
    }
  });
});

describe("SupplierProfile — per-claim evidence drawer", () => {
  it("lists one claim per displayed fact, each with its source", () => {
    const { container } = render(<SupplierProfile supplier={baseSupplier} />);
    const drawer = container.querySelector('[data-slot="evidence-drawer"]');
    expect(drawer).toBeTruthy();
    const expected = profileClaims(baseSupplier);
    // 6 base claims + 7 sourced optionals + 1 cert + 2 price signals = 16.
    expect(expected.length).toBe(16);
    expect(drawer?.textContent).toContain("Evidence — every claim and its source (16)");
    const links = drawer?.querySelectorAll("[data-source-link]");
    expect(links?.length).toBe(expected.length);
  });

  it("omits drawer entries for unknown fields — no source, no claim", () => {
    const claims = profileClaims(supplierWithUnknowns);
    const labels = claims.map((claim) => claim.label);
    expect(labels).not.toContain("MOQ");
    expect(labels).not.toContain("HQ");
    expect(labels).toContain("Certifications");
  });

  it("renders price signals with tier labels and verbatim values", () => {
    const { container } = render(<SupplierProfile supplier={baseSupplier} />);
    const signals = container.querySelectorAll("[data-fact-field^='price-signal']");
    expect(signals.length).toBe(baseSupplier.priceSignals.length);
    expect(container.textContent).toContain("Quote-only");
    expect(container.textContent).toContain("Supplier-published");
    expect(container.textContent).toContain("USD 3,350.00/MT, FOB Jakarta");
  });

  it("renders a real catalog row with sources on every claim", () => {
    const first = catalogSuppliers[0];
    if (!first) throw new Error("catalog must not be empty");
    const { container } = render(<SupplierProfile supplier={first} />);
    expect(container.textContent).toContain(first.name.value);
    // Every source link points at the exact page the claim was read from.
    for (const link of container.querySelectorAll<HTMLAnchorElement>("[data-source-link]")) {
      expect(link.getAttribute("href")).toMatch(/^https?:\/\//);
    }
    const drawer = container.querySelector('[data-slot="evidence-drawer"]');
    expect(drawer?.textContent).toContain(
      `Evidence — every claim and its source (${profileClaims(first).length})`
    );
    for (const chip of container.querySelectorAll("[data-certification-chip]")) {
      expect(chip.textContent?.includes("Verified")).toBe(false);
    }
  });
});
