import type { JobResult, JobsAdapter, TestJobPayload } from "./types";

/**
 * Mock jobs adapter (F-10) — active when Inngest keys are absent. Runs the
 * job inline (immediately, same process) and logs the execution.
 */
export class InlineJobsAdapter implements JobsAdapter {
  readonly mode = "mock" as const;

  async sendTestJob(payload: TestJobPayload): Promise<JobResult> {
    const jobId = `inline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // Mock execution: log + no-op side effect, same shape as the real handler.
    console.log(`[jobs:inline] testJob executed (${jobId}): ${payload.message}`);
    return { ok: true, jobId, mode: "inline" };
  }
}
