// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceDrawer } from "@/components/catalog/evidence-drawer";
import { demoSourceRef } from "@/lib/catalog/fixtures";

afterEach(cleanup);

describe("EvidenceDrawer", () => {
  it("summarizes the claim count and lists every claim with its source", () => {
    render(
      <EvidenceDrawer
        claims={[
          { label: "MOQ", source: demoSourceRef },
          {
            label: "Name",
            source: { ...demoSourceRef, url: "https://example.com/other" },
          },
        ]}
      />
    );
    expect(screen.getByText(/Evidence \(2\)/)).toBeTruthy();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      demoSourceRef.url,
      "https://example.com/other",
    ]);
    expect(screen.getAllByText(/retrieved 2026-09-01/)).toHaveLength(2);
    expect(screen.getByText("MOQ")).toBeTruthy();
  });

  it("shows the source note when present", () => {
    render(
      <EvidenceDrawer
        claims={[
          {
            label: "Name",
            source: { ...demoSourceRef, note: "self-published" },
          },
        ]}
      />
    );
    expect(screen.getByText(/self-published/)).toBeTruthy();
  });

  it("opens on summary click", () => {
    const { container } = render(
      <EvidenceDrawer claims={[{ label: "Name", source: demoSourceRef }]} />
    );
    const details = container.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    fireEvent.click(container.querySelector("summary") as Element);
    expect(details.open).toBe(true);
  });

  it("renders an explanatory state without claims", () => {
    render(<EvidenceDrawer claims={[]} />);
    expect(screen.getByText(/Evidence \(0\)/)).toBeTruthy();
    expect(screen.getByText("No evidence recorded.")).toBeTruthy();
  });
});
