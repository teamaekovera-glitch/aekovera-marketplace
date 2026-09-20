// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FacetSidebar } from "@/components/catalog/facet-sidebar";

afterEach(cleanup);

const groups = [
  {
    key: "categories",
    label: "Categories",
    options: [
      { value: "coffee", count: 41 },
      { value: "spices", count: 7 },
    ],
  },
];

describe("FacetSidebar", () => {
  it("renders groups with options and counts", () => {
    render(<FacetSidebar groups={groups} />);
    expect(screen.getByText("Categories")).toBeTruthy();
    expect(screen.getByText("coffee")).toBeTruthy();
    expect(screen.getByText("(41)")).toBeTruthy();
    expect(screen.getByText("(7)")).toBeTruthy();
  });

  it("calls onToggle with the group key and value", () => {
    const onToggle = vi.fn();
    render(<FacetSidebar groups={groups} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText(/coffee/));
    expect(onToggle).toHaveBeenCalledWith("categories", "coffee");
  });

  it("reflects the selected state", () => {
    render(
      <FacetSidebar groups={groups} selected={{ categories: new Set(["coffee"]) }} />
    );
    const checked = screen.getByLabelText(/coffee/) as HTMLInputElement;
    const unchecked = screen.getByLabelText(/spices/) as HTMLInputElement;
    expect(checked.checked).toBe(true);
    expect(unchecked.checked).toBe(false);
  });

  it("renders an explanatory state without groups", () => {
    render(<FacetSidebar groups={[]} />);
    expect(screen.getByText("No filters available.")).toBeTruthy();
  });

  it("renders an explanatory state for an empty group", () => {
    render(<FacetSidebar groups={[{ key: "types", label: "Types", options: [] }]} />);
    expect(screen.getByText("No options.")).toBeTruthy();
  });
});
