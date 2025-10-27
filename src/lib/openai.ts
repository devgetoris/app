import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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
  private model: any;

  constructor(apiKey: string) {
    this.model = openai("gpt-4o");
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

IMPORTANT: Respond with ONLY the JSON object below - no markdown, no code blocks, no explanations. Just the raw JSON:

{
  "subject": "An attention-grabbing subject line (max 60 characters)",
  "body": "The plain text email body",
  "htmlBody": "The HTML formatted email body with proper formatting"
}`;

    try {
      const { text } = await generateText({
        model: this.model,
        system:
          "You are an expert email copywriter. You write personalized, engaging B2B outreach emails that get responses. You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations. Just the raw JSON object.",
        prompt,
        temperature: 0.7,
      });

      if (!text) {
        throw new Error("No content received from OpenAI");
      }

      // Extract JSON from the response, handling markdown code blocks
      let jsonText = text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Try to find JSON object in the text if it's not pure JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      try {
        const result = JSON.parse(jsonText) as EmailGenerationResponse;
        return result;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw text:", text);
        console.error("Processed text:", jsonText);
        throw new Error(
          `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
        );
      }
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

IMPORTANT: Respond with ONLY the JSON object below - no markdown, no code blocks, no explanations. Just the raw JSON:

{
  "subject": "Improved subject line",
  "body": "Improved plain text email body",
  "htmlBody": "Improved HTML formatted email body"
}`;

    try {
      const { text } = await generateText({
        model: this.model,
        system:
          "You are an expert email copywriter. You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations. Just the raw JSON object.",
        prompt,
        temperature: 0.7,
      });

      if (!text) {
        throw new Error("No content received from OpenAI");
      }

      // Extract JSON from the response, handling markdown code blocks
      let jsonText = text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Try to find JSON object in the text if it's not pure JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      try {
        return JSON.parse(jsonText) as EmailGenerationResponse;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw text:", text);
        console.error("Processed text:", jsonText);
        throw new Error(
          `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
        );
      }
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
