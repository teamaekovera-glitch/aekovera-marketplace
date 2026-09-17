import type { PlanId } from "./types";

/**
 * Plan configuration — pricing and feature gating from
 * docs/specs/01_REQUIREMENTS.md §8.1 and docs/specs/07_SECURITY_PAYMENTS_SPEC.md §4.1.
 *
 * Stripe price IDs are configurable via env so real IDs can drop in without
 * code changes (see src/lib/env.ts).
 */

export type SearchVisibility = "low" | "standard" | "boosted" | "priority";
export type AnalyticsTier = "basic" | "full" | "full_insights" | "full_intel";
export type AiOptimizationTier = "none" | "basic" | "advanced" | "advanced_dedicated";
export type PdfExportTier = "none" | "standard" | "branded" | "white_label";

/** Monthly submission allowance; `null` means unlimited. */
export type SubmissionQuota = { monthlyLimit: number | null };

export interface PlanFeatures {
  id: PlanId;
  label: string;
  /** Stripe price object id; free has none. */
  stripePriceId: string | null;
  yearlyPriceCents: number | null;
  /** Maximum listed products; `null` means unlimited. */
  maxProducts: number | null;
  profileTier: "basic" | "full" | "full_verified" | "full_verified_priority";
  searchVisibility: SearchVisibility;
  canViewOpportunities: true;
  submissionQuota: SubmissionQuota;
  messaging: boolean;
  analyticsTier: AnalyticsTier;
  aiOptimization: AiOptimizationTier;
  sampleRequests: boolean;
  pdfExport: PdfExportTier;
}

export const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: {
    id: "free",
    label: "Free",
    stripePriceId: null,
    yearlyPriceCents: null,
    maxProducts: 5,
    profileTier: "basic",
    searchVisibility: "low",
    canViewOpportunities: true,
    submissionQuota: { monthlyLimit: 0 },
    messaging: false,
    analyticsTier: "basic",
    aiOptimization: "none",
    sampleRequests: false,
    pdfExport: "none",
  },
  starter: {
    id: "starter",
    label: "Starter",
    stripePriceId: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "price_starter_yearly",
    yearlyPriceCents: 9900,
    maxProducts: null,
    profileTier: "full",
    searchVisibility: "standard",
    canViewOpportunities: true,
    submissionQuota: { monthlyLimit: 10 },
    messaging: true,
    analyticsTier: "full",
    aiOptimization: "basic",
    sampleRequests: true,
    pdfExport: "standard",
  },
  pro: {
    id: "pro",
    label: "Pro",
    stripePriceId: process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_pro_yearly",
    yearlyPriceCents: 24900,
    maxProducts: null,
    profileTier: "full_verified",
    searchVisibility: "boosted",
    canViewOpportunities: true,
    submissionQuota: { monthlyLimit: null },
    messaging: true,
    analyticsTier: "full_insights",
    aiOptimization: "advanced",
    sampleRequests: true,
    pdfExport: "branded",
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    stripePriceId:
      process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? "price_enterprise_yearly",
    yearlyPriceCents: 49900,
    maxProducts: null,
    profileTier: "full_verified_priority",
    searchVisibility: "priority",
    canViewOpportunities: true,
    submissionQuota: { monthlyLimit: null },
    messaging: true,
    analyticsTier: "full_intel",
    aiOptimization: "advanced_dedicated",
    sampleRequests: true,
    pdfExport: "white_label",
  },
} as const;

export function getPlanFeatures(plan: PlanId): PlanFeatures {
  return PLAN_FEATURES[plan];
}

export function isPlanId(value: string): value is PlanId {
  return value in PLAN_FEATURES;
}

/** True when the brand may create another submission this month. */
export function canSubmitToOpportunity(
  plan: PlanId,
  monthlySubmissionCount: number,
): boolean {
  const { monthlyLimit } = PLAN_FEATURES[plan].submissionQuota;
  return monthlyLimit === null || monthlySubmissionCount < monthlyLimit;
}

/** True when the brand may add another product. */
export function canAddProduct(plan: PlanId, currentProductCount: number): boolean {
  const max = PLAN_FEATURES[plan].maxProducts;
  return max === null || currentProductCount < max;
}

/** Messaging requires a paid plan (01 spec FR-Y07, 07 spec §4.1). */
export function canMessage(plan: PlanId): boolean {
  return PLAN_FEATURES[plan].messaging;
}
