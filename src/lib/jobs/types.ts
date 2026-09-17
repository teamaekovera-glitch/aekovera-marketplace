/**
 * Typed background-jobs adapter interface (F-10).
 *
 * Implementations: InngestJobsAdapter (keys present) and
 * InlineJobsAdapter (mock — executes the job immediately, in-process).
 */
export interface TestJobPayload {
  message: string;
}

export type JobResult =
  | { ok: true; jobId: string; mode: "inngest" | "inline" }
  | { ok: false; error: string };

export interface JobsAdapter {
  readonly mode: "inngest" | "mock";

  /** One working test job proving the wiring end-to-end. */
  sendTestJob(payload: TestJobPayload): Promise<JobResult>;
}
