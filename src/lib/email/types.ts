/**
 * Typed email adapter interface (F-11).
 */
export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  mode: "resend" | "mock";
}

export interface EmailAdapter {
  readonly mode: "resend" | "mock";

  send(email: TransactionalEmail): Promise<SentEmail>;
}
