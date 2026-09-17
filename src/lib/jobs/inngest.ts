import { Inngest } from "inngest";
import type { JobResult, JobsAdapter, TestJobPayload } from "./types";

/**
 * Inngest jobs adapter (F-10) — active when INNGEST_EVENT_KEY and
 * INNGEST_SIGNING_KEY exist. The function registered here is served through
 * /api/inngest (see src/app/api/inngest/route.ts).
 */
export const TEST_JOB_EVENT = "marketplace/test.job";

export class InngestJobsAdapter implements JobsAdapter {
  readonly mode = "inngest" as const;

  private client: Inngest;

  constructor(eventKey: string, signingKey: string) {
    this.client = new Inngest({
      id: "aekovera-marketplace",
      eventKey,
      signingKey,
    });
  }

  /** Expose the client for the Inngest route handler registration. */
  get inngestClient(): Inngest {
    return this.client;
  }

  async sendTestJob(payload: TestJobPayload): Promise<JobResult> {
    try {
      const event = await this.client.send({
        name: TEST_JOB_EVENT,
        data: payload,
      });
      const ids = event.ids;
      return {
        ok: true,
        jobId: Array.isArray(ids) && ids[0] ? ids[0] : "accepted",
        mode: "inngest",
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Inngest send failed.",
      };
    }
  }
}

/** The test function definition served via /api/inngest (F-10 "one working test job"). */
export function inngestTestFunction(client: Inngest) {
  return client.createFunction(
    { id: "test-job", name: "Test job" },
    { event: TEST_JOB_EVENT },
    async ({ event, step }) => {
      await step.run("log-message", () => {
        console.log(`[inngest] test job executed: ${event.data.message}`);
        return { delivered: true };
      });
      return { ok: true };
    },
  );
}
