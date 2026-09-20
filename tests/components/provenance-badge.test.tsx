// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProvenanceBadge } from "@/components/catalog/provenance-badge";

afterEach(cleanup);

describe("ProvenanceBadge", () => {
  it.each([
    "Official-site",
    "Official-site + association context",
    "Registry",
    "Unverified",
  ] as const)("renders the verification level %s verbatim", (level) => {
    render(<ProvenanceBadge supplier={{ verificationLevel: level, confidence: "High" }} />);
    expect(screen.getByText(level)).toBeTruthy();
    expect(screen.getByText("Confidence: High")).toBeTruthy();
  });

  it("renders every confidence level", () => {
    for (const confidence of ["High", "Medium-High", "Medium", "Low"] as const) {
      const { unmount } = render(
        <ProvenanceBadge supplier={{ verificationLevel: "Registry", confidence }} />
      );
      expect(screen.getByText(`Confidence: ${confidence}`)).toBeTruthy();
      unmount();
    }
  });

  it("does not claim verification by itself", () => {
    const { container } = render(
      <ProvenanceBadge supplier={{ verificationLevel: "Official-site", confidence: "Medium" }} />
    );
    expect(container.textContent).not.toContain("Verified");
  });

  it("discloses Unverified rows honestly (row-level, not a certification chip)", () => {
    const { container } = render(
      <ProvenanceBadge supplier={{ verificationLevel: "Unverified", confidence: "Low" }} />
    );
    expect(container.textContent).toContain("Unverified");
  });
});
