import { Resend } from "resend";
import type { EmailAdapter, SentEmail, TransactionalEmail } from "./types";

/**
 * Resend email adapter (F-11) — active when RESEND_API_KEY exists.
 */
export class ResendEmailAdapter implements EmailAdapter {
  readonly mode = "resend" as const;

  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async send(email: TransactionalEmail): Promise<SentEmail> {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email.to,
      subject: email.subject,
      html: email.html,
      ...(email.replyTo ? { replyTo: email.replyTo } : {}),
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
    return {
      id: data?.id ?? "resend",
      to: email.to,
      subject: email.subject,
      mode: "resend",
    };
  }
}
