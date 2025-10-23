import { Resend } from "resend";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResponse {
  id: string;
  from: string;
  to: string;
  created_at: string;
}

class ResendService {
  private client: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.client = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  /**
   * Send an email
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
    try {
      const { data, error } = await this.client.emails.send({
        from: params.from || this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data received from Resend");
      }

      return data as SendEmailResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Resend service error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Send batch emails
   */
  async sendBatchEmails(
    emails: SendEmailParams[]
  ): Promise<SendEmailResponse[]> {
    try {
      const results = await Promise.allSettled(
        emails.map((email) => this.sendEmail(email))
      );

      return results
        .filter(
          (result): result is PromiseFulfilledResult<SendEmailResponse> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Resend batch service error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get email by ID
   */
  async getEmail(emailId: string) {
    try {
      const { data, error } = await this.client.emails.get(emailId);

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Resend service error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let resendService: ResendService | null = null;

export function getResendService(): ResendService {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendService) {
    resendService = new ResendService(process.env.RESEND_API_KEY, fromEmail);
  }

  return resendService;
}

export default ResendService;
