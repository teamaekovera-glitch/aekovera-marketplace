/**
 * Environment parsing and mock-mode detection.
 *
 * MOCK-FIRST DOCTRINE: every check here answers "is this service configured?"
 * The app must boot, build, and pass tests with all values empty. Adapter
 * factories consult these flags and fall back to mock implementations.
 */

const nonEmpty = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

function supabaseConfigured(): boolean {
  return (
    nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function supabaseServiceConfigured(): boolean {
  return (
    nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

function algoliaConfigured(): boolean {
  return (
    nonEmpty(process.env.ALGOLIA_APP_ID) &&
    nonEmpty(process.env.ALGOLIA_ADMIN_API_KEY)
  );
}

function stripeConfigured(): boolean {
  return nonEmpty(process.env.STRIPE_SECRET_KEY);
}

function resendConfigured(): boolean {
  return nonEmpty(process.env.RESEND_API_KEY);
}

function inngestConfigured(): boolean {
  return (
    nonEmpty(process.env.INNGEST_EVENT_KEY) &&
    nonEmpty(process.env.INNGEST_SIGNING_KEY)
  );
}

function sentryConfigured(): boolean {
  return (
    nonEmpty(process.env.SENTRY_DSN) || nonEmpty(process.env.NEXT_PUBLIC_SENTRY_DSN)
  );
}

function posthogConfigured(): boolean {
  return nonEmpty(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  algoliaAppId: process.env.ALGOLIA_APP_ID ?? "",
  algoliaAdminKey: process.env.ALGOLIA_ADMIN_API_KEY ?? "",
  algoliaSearchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? "",
  algoliaBrandsIndex: process.env.ALGOLIA_BRANDS_INDEX ?? "brands",
  algoliaProductsIndex: process.env.ALGOLIA_PRODUCTS_INDEX ?? "products",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL ??
    "Aekovera Marketplace <noreply@aekovera.example>",
  inngestEventKey: process.env.INNGEST_EVENT_KEY ?? "",
  inngestSigningKey: process.env.INNGEST_SIGNING_KEY ?? "",
  sentryDsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

/**
 * Feature flags consumed by adapter factories and the health endpoint.
 * Each value means "real integration active"; "mock" = mock adapter.
 */
export const serviceMode = {
  get supabaseAuth(): "supabase" | "mock" {
    return supabaseConfigured() ? "supabase" : "mock";
  },
  get supabaseDb(): "supabase" | "mock" {
    return supabaseServiceConfigured() ? "supabase" : "mock";
  },
  get search(): "algolia" | "mock" {
    return algoliaConfigured() ? "algolia" : "mock";
  },
  get billing(): "stripe" | "mock" {
    return stripeConfigured() ? "stripe" : "mock";
  },
  get email(): "resend" | "mock" {
    return resendConfigured() ? "resend" : "mock";
  },
  get jobs(): "inngest" | "mock" {
    return inngestConfigured() ? "inngest" : "mock";
  },
  get sentry(): "sentry" | "off" {
    return sentryConfigured() ? "sentry" : "off";
  },
  get posthog(): "posthog" | "off" {
    return posthogConfigured() ? "posthog" : "off";
  },
} as const;

/**
 * True when the app is running with zero external service keys — the
 * mock-first contract state (CI, local dev, preview).
 */
export function isFullMockMode(): boolean {
  return (
    serviceMode.supabaseAuth === "mock" &&
    serviceMode.search === "mock" &&
    serviceMode.billing === "mock" &&
    serviceMode.email === "mock" &&
    serviceMode.jobs === "mock"
  );
}

/**
 * Partial-configuration detector: a service with some but not all of its keys
 * set is almost always a mistake. Returns human-readable problems; empty
 * array when everything is fully configured or cleanly absent.
 */
export function findPartialConfigurations(): string[] {
  const problems: string[] = [];
  const pairs: Array<[string, boolean, boolean]> = [
    ["Supabase", supabaseConfigured(), nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)],
    ["Algolia", algoliaConfigured(), nonEmpty(process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY)],
    ["Stripe", stripeConfigured(), nonEmpty(process.env.STRIPE_WEBHOOK_SECRET)],
    ["Inngest", inngestConfigured(), nonEmpty(process.env.INNGEST_EVENT_KEY)],
  ];
  for (const [name, primary, secondary] of pairs) {
    if (primary !== secondary) {
      problems.push(
        `${name} is partially configured — set all of its keys or none of them.`,
      );
    }
  }
  return problems;
}
