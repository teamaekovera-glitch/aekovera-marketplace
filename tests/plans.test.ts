import { describe, expect, it } from "vitest";
import {
  PLAN_FEATURES,
  canAddProduct,
  canMessage,
  canSubmitToOpportunity,
  getPlanFeatures,
  isPlanId,
} from "../src/lib/plans";
import { PLANS } from "../src/lib/types";

describe("plan feature matrix (F-08: Free/Starter/Pro/Enterprise)", () => {
  it("covers every plan id exactly once", () => {
    expect(Object.keys(PLAN_FEATURES).sort()).toEqual([...PLANS].sort());
  });

  it("free plan caps products at 5 and blocks submissions and messaging", () => {
    const free = getPlanFeatures("free");
    expect(free.maxProducts).toBe(5);
    expect(free.submissionQuota.monthlyLimit).toBe(0);
    expect(free.messaging).toBe(false);
    expect(free.stripePriceId).toBeNull();
  });

  it("paid plans unlock messaging, submissions, and samples", () => {
    for (const plan of ["starter", "pro", "enterprise"] as const) {
      const features = getPlanFeatures(plan);
      expect(features.messaging).toBe(true);
      expect(features.sampleRequests).toBe(true);
      expect(features.stripePriceId).not.toBeNull();
    }
  });

  it("enterprise has no submission or product limits", () => {
    const enterprise = getPlanFeatures("enterprise");
    expect(enterprise.maxProducts).toBeNull();
    expect(enterprise.submissionQuota.monthlyLimit).toBeNull();
  });

  it("search visibility escalates with plan tier", () => {
    expect(PLAN_FEATURES.free.searchVisibility).toBe("low");
    expect(PLAN_FEATURES.starter.searchVisibility).toBe("standard");
    expect(PLAN_FEATURES.pro.searchVisibility).toBe("boosted");
    expect(PLAN_FEATURES.enterprise.searchVisibility).toBe("priority");
  });
});

describe("plan gating helpers", () => {
  it("canSubmitToOpportunity enforces the monthly quota", () => {
    expect(canSubmitToOpportunity("free", 0)).toBe(false);
    expect(canSubmitToOpportunity("starter", 9)).toBe(true);
    expect(canSubmitToOpportunity("starter", 10)).toBe(false);
    expect(canSubmitToOpportunity("pro", 999_999)).toBe(true); // unlimited
  });

  it("canAddProduct enforces the catalog cap", () => {
    expect(canAddProduct("free", 4)).toBe(true);
    expect(canAddProduct("free", 5)).toBe(false);
    expect(canAddProduct("pro", 10_000)).toBe(true); // unlimited
  });

  it("canMessage is paid-plan only", () => {
    expect(canMessage("free")).toBe(false);
    expect(canMessage("starter")).toBe(true);
  });

  it("isPlanId rejects unknown ids", () => {
    expect(isPlanId("pro")).toBe(true);
    expect(isPlanId("platinum")).toBe(false);
  });
});
