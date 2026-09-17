/**
 * Env-gated telemetry (F-12 Sentry, F-13 PostHog).
 *
 * The app NEVER requires these to boot: every helper is a no-op unless its
 * DSN/key is configured. Sentry is loaded lazily via dynamic import so a
 * missing or failing SDK cannot affect startup.
 */
import { serviceMode } from "./env";

export async function captureException(error: unknown, context?: Record<string, unknown>): Promise<void> {
  if (serviceMode.sentry === "off") return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Telemetry must never break the app; report to server logs instead.
    console.error("[telemetry] sentry unavailable:", error);
  }
}

export async function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): Promise<void> {
  if (serviceMode.sentry === "off") return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage(message, level);
  } catch {
    console.error(`[telemetry] ${level}: ${message}`);
  }
}

export function isPostHogEnabled(): boolean {
  return serviceMode.posthog === "posthog";
}
