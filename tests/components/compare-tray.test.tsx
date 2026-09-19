// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompareTray } from "@/components/catalog/compare-tray";
import { MAX_COMPARE } from "@/lib/catalog/display";
import {
  baseSupplier,
  demoSourceRef,
  makeSupplier,
  quarantinedSupplier,
} from "@/lib/catalog/fixtures";

afterEach(cleanup);

function namedSupplier(n: number) {
  return makeSupplier({
    id: `demo-n${n}`,
    name: { value: `Supplier ${n}`, source: demoSourceRef },
  });
}

describe("CompareTray", () => {
  it("renders at most MAX_COMPARE columns", () => {
    const five = [1, 2, 3, 4, 5].map(namedSupplier);
    const { container } = render(<CompareTray suppliers={five} />);
    expect(container.querySelectorAll("[data-compare-column]")).toHaveLength(
      MAX_COMPARE
    );
    expect(container.textContent).toContain("Comparing 3 of max 3");
    expect(container.textContent).not.toContain("Supplier 4");
    expect(container.textContent).not.toContain("Supplier 5");
  });

  it("calls onRemove with the removed supplier id", () => {
    const onRemove = vi.fn();
    render(<CompareTray suppliers={[baseSupplier]} onRemove={onRemove} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Demo Supplier Co. from comparison" })
    );
    expect(onRemove).toHaveBeenCalledWith(baseSupplier.id);
  });

  it("excludes quarantined rows even when handed them", () => {
    const { container } = render(
      <CompareTray suppliers={[baseSupplier, quarantinedSupplier]} />
    );
    expect(container.querySelectorAll("[data-compare-column]")).toHaveLength(1);
    expect(container.textContent).not.toContain("Quarantine Candidate Ltd");
  });

  it("renders an explanatory state without suppliers", () => {
    render(<CompareTray suppliers={[]} />);
    expect(screen.getByText(/No suppliers selected for comparison/)).toBeTruthy();
  });
});
