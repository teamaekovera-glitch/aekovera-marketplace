import type { EmailAdapter, SentEmail, TransactionalEmail } from "./types";

/**
 * Mock email adapter (F-11) — active when RESEND_API_KEY is absent. Logs the
 * full email instead of sending and keeps a per-process outbox for tests.
 */
export class MockEmailAdapter implements EmailAdapter {
  readonly mode = "mock" as const;

  private outbox: SentEmail[] = [];

  async send(email: TransactionalEmail): Promise<SentEmail> {
    const sent: SentEmail = {
      id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      to: email.to,
      subject: email.subject,
      mode: "mock",
    };
    this.outbox.push(sent);
    console.log(
      `[email:mock] to=${email.to} subject="${email.subject}" html=${email.html.length}b`,
    );
    return sent;
  }

  /** Test hook: drain the recorded outbox. */
  drainOutbox(): SentEmail[] {
    const all = [...this.outbox];
    this.outbox = [];
    return all;
  }
}
