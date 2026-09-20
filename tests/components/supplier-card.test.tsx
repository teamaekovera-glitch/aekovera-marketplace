// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SupplierCard } from "@/components/catalog/supplier-card";
import { UNKNOWN_LABEL } from "@/components/catalog/unknown-field";
import {
  baseSupplier,
  demoSourceRef,
  supplierWithUnknowns,
} from "@/lib/catalog/fixtures";

afterEach(cleanup);

describe("SupplierCard", () => {
  it("renders the name linked to its source", () => {
    render(<SupplierCard supplier={baseSupplier} />);
    const link = screen.getByRole("link", { name: "Demo Supplier Co." });
    expect(link.getAttribute("href")).toBe(demoSourceRef.url);
  });

  it("renders sourced facts with their values", () => {
    render(<SupplierCard supplier={baseSupplier} />);
    expect(screen.getByText("1 MT")).toBeTruthy();
    expect(screen.getByText("Samples available on request")).toBeTruthy();
    expect(screen.getByText("12,000 MT/year")).toBeTruthy();
    expect(screen.getByText("robusta green coffee")).toBeTruthy();
  });

  it("renders null fields with the Unknown label", () => {
    const { container } = render(<SupplierCard supplier={supplierWithUnknowns} />);
    const unknowns = container.querySelectorAll('[data-provenance="unknown"]');
    expect(unknowns).toHaveLength(6);
    for (const el of unknowns) {
      expect(el.textContent).toBe(UNKNOWN_LABEL);
    }
  });

  it("renders certifications as Company-stated chips with citations", () => {
    const { container } = render(<SupplierCard supplier={baseSupplier} />);
    expect(container.textContent).toContain("ISO 9001:2015 · Company-stated");
    const chips = container.querySelectorAll("[data-certification-chip]");
    expect(chips).toHaveLength(1);
    for (const chip of chips) {
      expect(chip.textContent).toContain("Company-stated");
    }
  });

  it("renders the reviewed-page-none state for empty certifications", () => {
    const { container } = render(<SupplierCard supplier={supplierWithUnknowns} />);
    expect(container.textContent).toContain("None listed on the reviewed page.");
  });

  it("renders price signals with tier labels and verbatim values", () => {
    render(<SupplierCard supplier={baseSupplier} />);
    expect(screen.getByText("Quote-only")).toBeTruthy();
    expect(screen.getByText("Supplier-published")).toBeTruthy();
    expect(screen.getByText("USD 3,350.00/MT, FOB Jakarta")).toBeTruthy();
    expect(screen.getByText("as of Q2 2026")).toBeTruthy();
  });

  it("toggles comparison", () => {
    const onToggleCompare = vi.fn();
    const { rerender } = render(
      <SupplierCard supplier={baseSupplier} onToggleCompare={onToggleCompare} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Compare" }));
    expect(onToggleCompare).toHaveBeenCalledWith(baseSupplier.id);

    rerender(
      <SupplierCard
        supplier={baseSupplier}
        onToggleCompare={onToggleCompare}
        compareSelected
      />
    );
    const selected = screen.getByRole("button", { name: "In comparison" });
    expect(selected.getAttribute("aria-pressed")).toBe("true");
  });

  it("summarizes per-claim evidence with sources and dates", () => {
    render(<SupplierCard supplier={baseSupplier} />);
    expect(screen.getByText(/Evidence \(16\)/)).toBeTruthy();
    const drawer = screen.getByText(/Evidence \(16\)/).closest("details") as HTMLDetailsElement;
    const scoped = within(drawer);
    expect(scoped.getByText("Certification: ISO 9001:2015 (Company-stated)")).toBeTruthy();
    expect(scoped.getByText("Price signal 1 (Quote-only)")).toBeTruthy();
    expect(
      scoped.getAllByRole("link", { name: demoSourceRef.url }).length
    ).toBeGreaterThan(0);
  });
});
