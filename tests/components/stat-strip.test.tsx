// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatStrip } from "@/components/catalog/stat-strip";
import { demoSourceRef } from "@/lib/catalog/fixtures";

afterEach(cleanup);

describe("StatStrip", () => {
  it("renders label and value pairs", () => {
    render(
      <StatStrip
        stats={[
          { label: "Suppliers", value: 41 },
          { label: "Regions", value: 1 },
        ]}
      />
    );
    expect(screen.getByText("Suppliers")).toBeTruthy();
    expect(screen.getByText("41")).toBeTruthy();
    expect(screen.getByText("Regions")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("links a sourced figure to its claim source", () => {
    render(
      <StatStrip
        stats={[
          { label: "Listed price", value: "USD 3,350.00/MT", source: demoSourceRef },
        ]}
      />
    );
    const link = screen.getByRole("link", { name: "USD 3,350.00/MT" });
    expect(link.getAttribute("href")).toBe(demoSourceRef.url);
  });

  it("renders an explanatory state without stats", () => {
    render(<StatStrip stats={[]} />);
    expect(screen.getByText("No stats to display.")).toBeTruthy();
  });
});
