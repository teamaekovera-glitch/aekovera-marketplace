// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SourceCitation, SourceLink, SourcedText } from "@/components/catalog/source-link";
import { demoSourceRef } from "@/lib/catalog/fixtures";

afterEach(cleanup);

describe("SourceLink", () => {
  it("renders the value as a link to the page it was read from", () => {
    render(<SourceLink sourced={{ value: "Demo Supplier Co.", source: demoSourceRef }} />);
    const link = screen.getByRole("link", { name: "Demo Supplier Co." });
    expect(link.getAttribute("href")).toBe(demoSourceRef.url);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("title")).toContain(demoSourceRef.retrievedAt);
    expect(link.getAttribute("title")).toContain(demoSourceRef.url);
  });
});

describe("SourceCitation", () => {
  it("renders a Source link for claims whose value is not itself a link", () => {
    render(<SourceCitation source={demoSourceRef} />);
    const link = screen.getByRole("link", { name: "Source" });
    expect(link.getAttribute("href")).toBe(demoSourceRef.url);
    expect(link.getAttribute("title")).toContain("2026-09-01");
  });
});

describe("SourcedText", () => {
  it("renders a SourceLink for a sourced value", () => {
    render(<SourcedText sourced={{ value: "1 MT", source: demoSourceRef }} />);
    expect(screen.getByRole("link", { name: "1 MT" })).toBeTruthy();
  });

  it("renders the Unknown label when no source exists", () => {
    const { container } = render(<SourcedText sourced={null} />);
    expect(container.textContent).toBe("Unknown — pending verification");
  });
});
