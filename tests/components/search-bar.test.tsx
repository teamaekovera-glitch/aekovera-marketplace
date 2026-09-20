// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/components/catalog/search-bar";

afterEach(cleanup);

describe("SearchBar", () => {
  it("calls onChange with the typed value", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Search suppliers"), {
      target: { value: "coffee" },
    });
    expect(onChange).toHaveBeenCalledWith("coffee");
  });

  it("reflects the controlled value", () => {
    render(<SearchBar value="pepper" onChange={vi.fn()} />);
    const input = screen.getByLabelText("Search suppliers") as HTMLInputElement;
    expect(input.value).toBe("pepper");
  });

  it("keeps the search input accessible", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    const input = screen.getByLabelText("Search suppliers");
    expect(input.getAttribute("type")).toBe("search");
    expect(input.getAttribute("placeholder")).toContain("Search suppliers");
  });
});
