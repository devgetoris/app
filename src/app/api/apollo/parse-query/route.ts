import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface ParsedQuery {
  // Basic search
  keywords?: string;

  // People search parameters
  person_titles?: string[];
  person_seniorities?: string[];
  person_locations?: string[];
  include_similar_titles?: boolean;
  contact_email_status?: string[];

  // Organization search parameters
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_ids?: string[];
  q_organization_domains_list?: string[];
  revenue_range?: {
    min?: number;
    max?: number;
  };

  // Technology filters
  currently_using_all_of_technology_uids?: string[];
  currently_using_any_of_technology_uids?: string[];
  currently_not_using_any_of_technology_uids?: string[];

  // Job posting filters
  q_organization_job_titles?: string[];
  organization_job_locations?: string[];
  organization_num_jobs_range?: {
    min?: number;
    max?: number;
  };
  organization_job_posted_at_range?: {
    min?: string;
    max?: string;
  };

  // Pagination
  page?: number;
  per_page?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log("🤖 AI Query Parser - Input query:", query);

    // Use OpenAI to parse the natural language query
    const systemPrompt = `You are an expert at parsing natural language lead search queries into structured search parameters for Apollo API.

Your task is to extract and interpret ALL possible Apollo API parameters from natural language queries. Be AGGRESSIVE in finding matches - cast a wide net to ensure we find relevant results.

PEOPLE SEARCH PARAMETERS:
- person_titles: Job titles (e.g., "VP", "CEO", "Director", "Manager", "Engineer", "CTO", "CFO")
- person_seniorities: Seniority levels (owner, founder, c_suite, partner, vp, head, director, manager, senior, entry, intern)
- person_locations: Where people live (cities, states, countries)
- include_similar_titles: Whether to include similar job titles (ALWAYS set to true for broader search)
- contact_email_status: Email statuses (verified, unverified, likely to engage, unavailable)

ORGANIZATION SEARCH PARAMETERS:
- organization_locations: Company headquarters locations
- organization_num_employees_ranges: Employee count ranges (format: "1,10", "100,500", "1000,5000")
- q_organization_domains_list: Company domains (without www or @)
- revenue_range: Company revenue range (min/max numbers)
- organization_ids: Specific Apollo organization IDs

TECHNOLOGY FILTERS:
- currently_using_all_of_technology_uids: Technologies company must use ALL of
- currently_using_any_of_technology_uids: Technologies company uses ANY of
- currently_not_using_any_of_technology_uids: Technologies company does NOT use

JOB POSTING FILTERS:
- q_organization_job_titles: Job titles in active postings
- organization_job_locations: Locations of active job postings
- organization_num_jobs_range: Number of active job postings (min/max)
- organization_job_posted_at_range: Date range for job postings (YYYY-MM-DD format)

BASIC SEARCH:
- keywords: General search terms (use liberally for broader search)
- page: Page number (default: 1)
- per_page: Results per page (default: 25)

IMPORTANT RULES:
1. ALWAYS set include_similar_titles to true for broader search
2. When in doubt, add keywords to capture more results
3. Expand location names (SF → San Francisco, NY → New York, etc.)
4. Add related job titles when possible (CTO → CTO, Chief Technology Officer, etc.)
5. Include both person_locations AND organization_locations when location is mentioned
6. Be liberal with company size ranges to cast a wider net

Return ONLY a valid JSON object with no markdown or extra text. Use null for missing values, empty arrays for missing arrays.

Examples:
- "VP in SF" → {"person_titles": ["VP", "Vice President"], "person_locations": ["San Francisco"], "organization_locations": ["San Francisco"], "include_similar_titles": true, "keywords": "VP San Francisco"}
- "CTOs in AI startups" → {"person_titles": ["CTO", "Chief Technology Officer"], "keywords": "AI artificial intelligence startup", "organization_num_employees_ranges": ["1,10", "11,50", "51,200"], "include_similar_titles": true}
- "Directors at Salesforce" → {"person_titles": ["Director"], "q_organization_domains_list": ["salesforce.com"], "keywords": "Salesforce director", "include_similar_titles": true}
- "Engineers using React" → {"person_titles": ["Engineer", "Software Engineer", "Developer"], "currently_using_any_of_technology_uids": ["react", "javascript", "frontend"], "keywords": "React engineer developer", "include_similar_titles": true}
- "Companies hiring in Austin" → {"organization_job_locations": ["Austin"], "keywords": "hiring Austin jobs", "include_similar_titles": true}`;

    const userMessage = `Parse this lead search query: "${query}"`;

    console.log("🔄 AI Query Parser - Sending to OpenAI...");

    const { text } = await generateText({
      model: openai("gpt-4o", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      system: systemPrompt,
      prompt: userMessage,
    });

    console.log("✅ AI Query Parser - OpenAI response:", text);

    // Parse the JSON response
    const parsedQuery = JSON.parse(text || "{}") as ParsedQuery;

    // Set defaults
    const result = {
      keywords: parsedQuery.keywords || null,
      person_titles: parsedQuery.person_titles || [],
      person_seniorities: parsedQuery.person_seniorities || [],
      person_locations: parsedQuery.person_locations || [],
      include_similar_titles: parsedQuery.include_similar_titles ?? true,
      contact_email_status: parsedQuery.contact_email_status || [],
      organization_locations: parsedQuery.organization_locations || [],
      organization_num_employees_ranges:
        parsedQuery.organization_num_employees_ranges || [],
      organization_ids: parsedQuery.organization_ids || [],
      q_organization_domains_list:
        parsedQuery.q_organization_domains_list || [],
      revenue_range: parsedQuery.revenue_range || null,
      currently_using_all_of_technology_uids:
        parsedQuery.currently_using_all_of_technology_uids || [],
      currently_using_any_of_technology_uids:
        parsedQuery.currently_using_any_of_technology_uids || [],
      currently_not_using_any_of_technology_uids:
        parsedQuery.currently_not_using_any_of_technology_uids || [],
      q_organization_job_titles: parsedQuery.q_organization_job_titles || [],
      organization_job_locations: parsedQuery.organization_job_locations || [],
      organization_num_jobs_range:
        parsedQuery.organization_num_jobs_range || null,
      organization_job_posted_at_range:
        parsedQuery.organization_job_posted_at_range || null,
      page: parsedQuery.page || 1,
      per_page: parsedQuery.per_page || 25,
    };

    console.log("🎯 AI Query Parser - Final parsed result:", result);

    return NextResponse.json({
      success: true,
      parsed: result,
      originalQuery: query,
    });
  } catch (error) {
    console.error("❌ AI Query Parser error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse query with AI",
      },
      { status: 500 }
    );
  }
}
