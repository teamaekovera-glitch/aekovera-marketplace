import { NextResponse } from "next/server";
import { findPartialConfigurations, isFullMockMode, serviceMode } from "@/lib/env";

/**
 * Health endpoint (also the middleware's public probe path). Reports the
 * active service modes so operators can confirm mock-first behavior with
 * zero keys and production modes once keys drop in.
 */
export function GET() {
  const partial = findPartialConfigurations();
  return NextResponse.json({
    ok: partial.length === 0,
    mode: isFullMockMode() ? "mock" : "hybrid",
    services: {
      auth: serviceMode.supabaseAuth,
      search: serviceMode.search,
      billing: serviceMode.billing,
      email: serviceMode.email,
      jobs: serviceMode.jobs,
      sentry: serviceMode.sentry,
      posthog: serviceMode.posthog,
    },
    warnings: partial,
  });
}
