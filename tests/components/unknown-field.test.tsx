// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UNKNOWN_LABEL, UnknownField } from "@/components/catalog/unknown-field";

afterEach(cleanup);

describe("UnknownField", () => {
  it("renders exactly 'Unknown — pending verification'", () => {
    const { container } = render(<UnknownField />);
    expect(container.textContent).toBe("Unknown — pending verification");
    expect(container.textContent).toBe(UNKNOWN_LABEL);
  });

  it("is marked as the unknown provenance state", () => {
    render(<UnknownField />);
    const el = screen.getByText("Unknown — pending verification");
    expect(el.getAttribute("data-provenance")).toBe("unknown");
  });

  it("never exposes an override for the label", () => {
    const { container } = render(<UnknownField className="text-destructive" />);
    expect(container.textContent).toBe(UNKNOWN_LABEL);
  });
});
