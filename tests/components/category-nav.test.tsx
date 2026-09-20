// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryNav } from "@/components/catalog/category-nav";

afterEach(cleanup);

describe("CategoryNav", () => {
  it("renders categories with counts", () => {
    render(
      <CategoryNav
        categories={[
          { value: "coffee", count: 41 },
          { value: "spices", count: 7 },
        ]}
      />
    );
    expect(screen.getByText("coffee")).toBeTruthy();
    expect(screen.getByText("41")).toBeTruthy();
    expect(screen.getByText("spices")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("calls onSelect with the chosen category", () => {
    const onSelect = vi.fn();
    render(
      <CategoryNav
        categories={[{ value: "coffee", count: 41 }, { value: "spices", count: 7 }]}
        selected="spices"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /coffee/ }));
    expect(onSelect).toHaveBeenCalledWith("coffee");
  });

  it("marks the selected category with aria-current", () => {
    render(
      <CategoryNav
        categories={[{ value: "coffee" }, { value: "spices" }]}
        selected="spices"
      />
    );
    expect(
      screen.getByRole("button", { name: /spices/ }).getAttribute("aria-current")
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: /coffee/ }).getAttribute("aria-current")
    ).toBeNull();
  });

  it("renders an explanatory state without categories", () => {
    render(<CategoryNav categories={[]} />);
    expect(screen.getByText("No categories yet.")).toBeTruthy();
  });
});
