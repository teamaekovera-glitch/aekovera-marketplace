"use client";

import posthog from "posthog-js";
import { useEffect, type ReactNode } from "react";
import { isPostHogEnabled } from "@/lib/telemetry";

/**
 * PostHog analytics provider (F-13). Renders children unchanged and no-ops
 * entirely when NEXT_PUBLIC_POSTHOG_KEY is absent — the app never requires
 * analytics to boot.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isPostHogEnabled()) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return <>{children}</>;
}
