import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedQuery {
  keywords?: string;
  jobTitles: string[];
  industries: string[];
  companySizes: string[];
  locations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    console.log("🤖 AI Query Parser - Input query:", query);

    // Use OpenAI to parse the natural language query
    const systemPrompt = `You are an expert at parsing natural language lead search queries into structured search parameters for an Apollo API lead database.

Your task is to extract and interpret:
- Job Titles (e.g., "VP", "CEO", "Director", "Manager", "Engineer")
- Industries (e.g., "Technology", "Finance", "Healthcare", "E-commerce")
- Company Sizes (e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+")
- Locations (e.g., "San Francisco", "New York", "Austin", "United States", "UK")
- Keywords (additional context or skills, e.g., "AI", "machine learning", "cloud")

Return ONLY a valid JSON object with no markdown or extra text:
{
  "keywords": "optional keywords, null if none",
  "jobTitles": ["array of job titles"],
  "industries": ["array of industries"],
  "companySizes": ["array of company sizes"],
  "locations": ["array of locations"]
}

If a field cannot be determined, use an empty array. If keywords are mentioned, include them.

Examples:
- "VP in SF" → {"keywords": null, "jobTitles": ["VP"], "industries": [], "companySizes": [], "locations": ["San Francisco"]}
- "CTOs in AI startups" → {"keywords": "AI", "jobTitles": ["CTO"], "industries": ["Technology"], "companySizes": ["1-10", "11-50"], "locations": []}
- "Product managers in NY tech companies with 100+ employees" → {"keywords": null, "jobTitles": ["Product Manager"], "industries": ["Technology"], "companySizes": ["101-500", "501-1000", "1001-5000", "5001-10000", "10001+"], "locations": ["New York"]}`;

    const userMessage = `Parse this lead search query: "${query}"`;

    console.log("🔄 AI Query Parser - Sending to OpenAI...");

    const message = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      response_format: { type: "json_object" },
    });

    const response = message.choices[0].message.content;

    console.log("✅ AI Query Parser - OpenAI response:", response);

    // Parse the JSON response
    const parsedQuery = JSON.parse(response || "{}") as ParsedQuery;

    // Normalize job titles - match common variations
    const jobTitleNormalizations: Record<string, string> = {
      "vp": "VP of Engineering",
      "vice president": "VP of Engineering",
      "director": "Director of Engineering",
      "manager": "Engineering Manager",
      "cto": "CTO",
      "ceo": "CEO",
      "cfo": "CFO",
      "coo": "COO",
      "head": "Head of Engineering",
      "lead": "Lead Developer",
      "principal": "Senior Software Engineer",
      "architect": "Senior Software Engineer",
      "engineer": "Software Engineer",
      "developer": "Lead Developer",
      "pm": "Product Manager",
      "product": "Product Manager",
      "sales": "VP of Sales",
    };

    // Normalize the extracted job titles
    const normalizedJobTitles = parsedQuery.jobTitles
      .map((title) => {
        const key = title.toLowerCase().trim();
        for (const [pattern, normalized] of Object.entries(
          jobTitleNormalizations
        )) {
          if (key.includes(pattern)) {
            return normalized;
          }
        }
        return title;
      })
      .filter((title) => title.length > 0);

    // Normalize industries
    const industryNormalizations: Record<string, string> = {
      "tech": "Computer Software",
      "technology": "Computer Software",
      "software": "Computer Software",
      "it": "Information Technology",
      "ai": "Computer Software",
      "startup": "Internet",
      "finance": "Financial Services",
      "banking": "Banking",
      "healthcare": "Healthcare",
      "education": "Education",
      "ecommerce": "E-commerce",
      "retail": "Retail",
    };

    const normalizedIndustries = parsedQuery.industries
      .map((industry) => {
        const key = industry.toLowerCase().trim();
        for (const [pattern, normalized] of Object.entries(
          industryNormalizations
        )) {
          if (key.includes(pattern)) {
            return normalized;
          }
        }
        return industry;
      })
      .filter((industry) => industry.length > 0);

    // Normalize locations - expand city names to major cities list
    const locationAbbreviations: Record<string, string> = {
      "sf": "San Francisco",
      "la": "Los Angeles",
      "ny": "New York",
      "nyc": "New York",
      "london": "London",
      "berlin": "Berlin",
      "amsterdam": "Amsterdam",
      "paris": "Paris",
      "toronto": "Toronto",
      "sydney": "Sydney",
      "singapore": "Singapore",
      "hk": "Hong Kong",
      "tokyo": "Tokyo",
      "bengaluru": "Bangalore",
      "india": "India",
      "us": "United States",
      "uk": "United Kingdom",
      "usa": "United States",
    };

    const normalizedLocations = parsedQuery.locations
      .map((location) => {
        const key = location.toLowerCase().trim();
        return locationAbbreviations[key] || location;
      })
      .filter((location) => location.length > 0);

    const result = {
      keywords: parsedQuery.keywords,
      jobTitles: normalizedJobTitles,
      industries: normalizedIndustries,
      companySizes: parsedQuery.companySizes,
      locations: normalizedLocations,
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
