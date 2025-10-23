import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getApolloClient } from "@/lib/apollo";
import { db } from "@/db";
import { leads, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      keywords,
      jobTitles,
      industries,
      companySizes,
      locations,
      page = 1,
      perPage = 25,
    } = body;

    const apolloClient = getApolloClient();

    // Build search params - only include non-empty values
    const searchParams: any = {
      page,
      per_page: perPage,
    };

    // Keywords - just pass them through
    if (keywords && keywords.trim()) {
      searchParams.q_keywords = keywords.trim();
    }

    // Job Titles - Apollo accepts an array
    if (jobTitles && Array.isArray(jobTitles) && jobTitles.length > 0) {
      searchParams.person_titles = jobTitles;
    }

    // Industries - use q_organization_keyword_tags which is more flexible
    if (industries && Array.isArray(industries) && industries.length > 0) {
      searchParams.q_organization_keyword_tags = industries;
    }

    // Company Sizes - Apollo accepts an array
    if (
      companySizes &&
      Array.isArray(companySizes) &&
      companySizes.length > 0
    ) {
      searchParams.organization_num_employees_ranges = companySizes;
    }

    // Locations - Apollo accepts an array
    if (locations && Array.isArray(locations) && locations.length > 0) {
      searchParams.organization_locations = locations;
    }

    // Log the search parameters for debugging
    console.log("Apollo Search Params:", JSON.stringify(searchParams, null, 2));

    // Validate that we have at least one search criterion
    const hasSearchCriteria =
      searchParams.q_keywords ||
      searchParams.person_titles ||
      searchParams.organization_industry_tag_ids ||
      searchParams.organization_num_employees_ranges ||
      searchParams.organization_locations;

    if (!hasSearchCriteria) {
      return NextResponse.json(
        { error: "Please provide at least one search criterion" },
        { status: 400 }
      );
    }

    // Search for leads
    const response = await apolloClient.searchContacts(searchParams);

    // Save leads to database
    const savedLeads = [];

    for (const contact of response.people || response.contacts || []) {
      // Check if lead already exists for this user
      const existingLead = await db.query.leads.findFirst({
        where: eq(leads.apolloId, contact.id),
      });

      if (!existingLead) {
        const [newLead] = await db
          .insert(leads)
          .values({
            userId: user.id,
            apolloId: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: contact.email,
            phone: contact.phone_numbers?.[0]?.sanitized_number,
            title: contact.title,
            seniority: contact.seniority,
            departments: contact.departments,

            // Company info
            companyName: contact.organization?.name,
            companyDomain: contact.organization?.primary_domain,
            companyIndustry: contact.organization?.industry,
            companySize: String(contact.organization?.estimated_num_employees),
            companyRevenue: contact.organization?.annual_revenue_printed,
            companyLocation: contact.organization?.raw_address,
            companyCity: contact.organization?.city,
            companyState: contact.organization?.state,
            companyCountry: contact.organization?.country,
            companyFunding: contact.organization?.publicly_traded_symbol,
            companyTechnologies: contact.organization?.technology_names,

            // Social profiles
            linkedinUrl: contact.linkedin_url,
            twitterUrl: contact.twitter_url,
            facebookUrl: contact.facebook_url,
            githubUrl: contact.github_url,

            // Additional data
            profilePhoto: contact.photo_url,
            bio: contact.headline,
            employmentHistory: contact.employment_history?.map(job => ({
              title: job.title || "",
              company: job.organization_name || "",
              startDate: job.start_date,
              endDate: job.end_date,
              current: job.current,
            })),
            education: contact.education?.map(edu => ({
              school: edu.organization_name || "",
              degree: edu.degree,
              field: edu.major,
              startDate: edu.start_date,
              endDate: edu.end_date,
            })),

            // Store full Apollo data for reference
            apolloData: contact,

            // Initial status
            status: "new",
          })
          .returning();

        savedLeads.push(newLead);
      } else {
        savedLeads.push(existingLead);
      }
    }

    return NextResponse.json({
      success: true,
      leads: savedLeads,
      pagination: response.pagination,
    });
  } catch (error) {
    console.error("Apollo search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search leads",
      },
      { status: 500 }
    );
  }
}
