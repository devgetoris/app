import OpenAI from "openai";

export interface EmailGenerationParams {
  leadName: string;
  leadTitle: string;
  leadCompany: string;
  leadIndustry?: string;
  leadBio?: string;
  leadEmploymentHistory?: Array<{
    title: string;
    company: string;
    current?: boolean;
  }>;

  // User preferences
  userCompany?: string;
  userIndustry?: string;
  userGoals?: string[];
  tone?: "professional" | "casual" | "friendly" | "formal";
  callToAction?: string;

  // Additional context
  customPrompt?: string;
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
  htmlBody: string;
}

class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Generate a personalized email for a lead
   */
  async generateEmail(
    params: EmailGenerationParams
  ): Promise<EmailGenerationResponse> {
    const {
      leadName,
      leadTitle,
      leadCompany,
      leadIndustry,
      leadBio,
      leadEmploymentHistory,
      userCompany,
      userIndustry,
      userGoals,
      tone = "professional",
      callToAction,
      customPrompt,
    } = params;

    // Build the context for the email
    const context = [];

    if (leadTitle && leadCompany) {
      context.push(`${leadName} is a ${leadTitle} at ${leadCompany}`);
    }

    if (leadIndustry) {
      context.push(`They work in the ${leadIndustry} industry`);
    }

    if (leadEmploymentHistory && leadEmploymentHistory.length > 0) {
      const prevRoles = leadEmploymentHistory
        .filter(role => !role.current)
        .slice(0, 2)
        .map(role => `${role.title} at ${role.company}`)
        .join(", ");

      if (prevRoles) {
        context.push(`Previously, they worked as ${prevRoles}`);
      }
    }

    if (leadBio) {
      context.push(`Background: ${leadBio}`);
    }

    // Build the prompt
    let prompt = `You are an expert email copywriter specializing in personalized B2B outreach.

Write a ${tone} email to ${leadName} for the following context:

Lead Information:
${context.join(". ")}.

Sender Information:
${userCompany ? `Company: ${userCompany}` : "A business professional"}
${userIndustry ? `Industry: ${userIndustry}` : ""}
${userGoals && userGoals.length > 0 ? `Goals: ${userGoals.join(", ")}` : ""}

Email Requirements:
1. Keep it concise (3-4 short paragraphs max)
2. Personalize based on their background and role
3. Make it relevant to their industry and position
4. Use a ${tone} tone throughout
5. ${callToAction || "Include a clear, non-pushy call to action"}
6. Avoid being salesy or pushy
7. Sound natural and human, not like a template

${customPrompt || ""}

Provide the response in the following JSON format:
{
  "subject": "An attention-grabbing subject line (max 60 characters)",
  "body": "The plain text email body",
  "htmlBody": "The HTML formatted email body with proper formatting"
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert email copywriter. You write personalized, engaging B2B outreach emails that get responses. You always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const result = JSON.parse(content) as EmailGenerationResponse;

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate multiple email variants for A/B testing
   */
  async generateEmailVariants(
    params: EmailGenerationParams,
    count: number = 2
  ): Promise<EmailGenerationResponse[]> {
    const variants = await Promise.all(
      Array.from({ length: count }, () => this.generateEmail(params))
    );
    return variants;
  }

  /**
   * Improve an existing email draft
   */
  async improveEmail(
    currentSubject: string,
    currentBody: string,
    feedback: string
  ): Promise<EmailGenerationResponse> {
    const prompt = `You are an expert email copywriter. Improve the following email based on the feedback provided.

Current Subject: ${currentSubject}

Current Body:
${currentBody}

Feedback: ${feedback}

Provide an improved version in the following JSON format:
{
  "subject": "Improved subject line",
  "body": "Improved plain text email body",
  "htmlBody": "Improved HTML formatted email body"
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert email copywriter. You always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      return JSON.parse(content) as EmailGenerationResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let openAIService: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (!openAIService) {
    openAIService = new OpenAIService(process.env.OPENAI_API_KEY);
  }

  return openAIService;
}

export default OpenAIService;
