import { serviceMode } from "../env";
import { MockAuthAdapter } from "./mock";
import { SupabaseAuthAdapter } from "./supabase";
import type { AuthAdapter } from "./types";

/**
 * Auth adapter factory (F-05/F-06). Returns the Supabase implementation when
 * Supabase keys are present, otherwise the mock adapter with seeded demo
 * users — mock-first doctrine.
 */
export function createAuthAdapter(): AuthAdapter {
  return serviceMode.supabaseAuth === "supabase"
    ? new SupabaseAuthAdapter()
    : new MockAuthAdapter();
}

export { MOCK_USERS } from "./mock";
export type { AuthAdapter } from "./types";
