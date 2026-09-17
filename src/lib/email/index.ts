import { env, serviceMode } from "../env";
import { MockEmailAdapter } from "./mock";
import { ResendEmailAdapter } from "./resend";
import type { EmailAdapter } from "./types";

/**
 * Email adapter factory (F-11): Resend when a key exists, otherwise the
 * logging mock — mock-first doctrine.
 */
export function createEmailAdapter(): EmailAdapter {
  return serviceMode.email === "resend"
    ? new ResendEmailAdapter(env.resendApiKey, env.resendFromEmail)
    : new MockEmailAdapter();
}

export type { EmailAdapter, SentEmail, TransactionalEmail } from "./types";
