import { env, serviceMode } from "../env";
import { InngestJobsAdapter } from "./inngest";
import { InlineJobsAdapter } from "./inline";
import type { JobsAdapter } from "./types";

/**
 * Jobs adapter factory (F-10): Inngest when keys exist, otherwise inline
 * execution — mock-first doctrine.
 */
export function createJobsAdapter(): JobsAdapter {
  return serviceMode.jobs === "inngest"
    ? new InngestJobsAdapter(env.inngestEventKey, env.inngestSigningKey)
    : new InlineJobsAdapter();
}

export { TEST_JOB_EVENT, inngestTestFunction } from "./inngest";
export type { JobsAdapter } from "./types";
