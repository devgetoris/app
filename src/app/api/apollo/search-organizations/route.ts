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
      // Basic search
      keywords,

      // Organization search parameters
      organization_locations,
      organization_num_employees_ranges,
      organization_ids,
      q_organization_domains_list,
      revenue_range,

      // Technology filters
      currently_using_all_of_technology_uids,
      currently_using_any_of_technology_uids,
      currently_not_using_any_of_technology_uids,

      // Job posting filters
      q_organization_job_titles,
      organization_job_locations,
      organization_num_jobs_range,
      organization_job_posted_at_range,

      // Pagination
      page = 1,
      per_page = 25,
    } = body;

    const apolloClient = getApolloClient();

    // Build search params - only include non-empty values
    const searchParams: any = {
      page,
      per_page,
    };

    // Basic search
    if (keywords && keywords.trim()) {
      searchParams.q_keywords = keywords.trim();
    }

    // Organization search parameters
    if (
      organization_locations &&
      Array.isArray(organization_locations) &&
      organization_locations.length > 0
    ) {
      const limitedOrgLocations = organization_locations.slice(0, 10);
      if (organization_locations.length > 10) {
        console.log(
          `⚠️ Organization location limit: Apollo limits to 10 locations. Limiting from ${organization_locations.length} to 10.`
        );
      }
      searchParams.organization_locations = limitedOrgLocations;
    }

    if (
      organization_num_employees_ranges &&
      Array.isArray(organization_num_employees_ranges) &&
      organization_num_employees_ranges.length > 0
    ) {
      searchParams.organization_num_employees_ranges =
        organization_num_employees_ranges;
    }

    if (
      organization_ids &&
      Array.isArray(organization_ids) &&
      organization_ids.length > 0
    ) {
      searchParams.organization_ids = organization_ids;
    }

    if (
      q_organization_domains_list &&
      Array.isArray(q_organization_domains_list) &&
      q_organization_domains_list.length > 0
    ) {
      searchParams.q_organization_domains_list = q_organization_domains_list;
    }

    if (
      revenue_range &&
      (revenue_range.min !== undefined || revenue_range.max !== undefined)
    ) {
      searchParams.revenue_range = {};
      if (revenue_range.min !== undefined) {
        searchParams.revenue_range.min = revenue_range.min;
      }
      if (revenue_range.max !== undefined) {
        searchParams.revenue_range.max = revenue_range.max;
      }
    }

    // Technology filters
    if (
      currently_using_all_of_technology_uids &&
      Array.isArray(currently_using_all_of_technology_uids) &&
      currently_using_all_of_technology_uids.length > 0
    ) {
      searchParams.currently_using_all_of_technology_uids =
        currently_using_all_of_technology_uids;
    }

    if (
      currently_using_any_of_technology_uids &&
      Array.isArray(currently_using_any_of_technology_uids) &&
      currently_using_any_of_technology_uids.length > 0
    ) {
      searchParams.currently_using_any_of_technology_uids =
        currently_using_any_of_technology_uids;
    }

    if (
      currently_not_using_any_of_technology_uids &&
      Array.isArray(currently_not_using_any_of_technology_uids) &&
      currently_not_using_any_of_technology_uids.length > 0
    ) {
      searchParams.currently_not_using_any_of_technology_uids =
        currently_not_using_any_of_technology_uids;
    }

    // Job posting filters
    if (
      q_organization_job_titles &&
      Array.isArray(q_organization_job_titles) &&
      q_organization_job_titles.length > 0
    ) {
      searchParams.q_organization_job_titles = q_organization_job_titles;
    }

    if (
      organization_job_locations &&
      Array.isArray(organization_job_locations) &&
      organization_job_locations.length > 0
    ) {
      searchParams.organization_job_locations = organization_job_locations;
    }

    if (
      organization_num_jobs_range &&
      (organization_num_jobs_range.min !== undefined ||
        organization_num_jobs_range.max !== undefined)
    ) {
      searchParams.organization_num_jobs_range = {};
      if (organization_num_jobs_range.min !== undefined) {
        searchParams.organization_num_jobs_range.min =
          organization_num_jobs_range.min;
      }
      if (organization_num_jobs_range.max !== undefined) {
        searchParams.organization_num_jobs_range.max =
          organization_num_jobs_range.max;
      }
    }

    if (
      organization_job_posted_at_range &&
      (organization_job_posted_at_range.min ||
        organization_job_posted_at_range.max)
    ) {
      searchParams.organization_job_posted_at_range = {};
      if (organization_job_posted_at_range.min) {
        searchParams.organization_job_posted_at_range.min =
          organization_job_posted_at_range.min;
      }
      if (organization_job_posted_at_range.max) {
        searchParams.organization_job_posted_at_range.max =
          organization_job_posted_at_range.max;
      }
    }

    // Log the search parameters for debugging
    console.log(
      "🏢 Apollo Organization Search Params:",
      JSON.stringify(searchParams, null, 2)
    );

    // Validate that we have at least one search criterion
    const hasSearchCriteria =
      searchParams.q_keywords ||
      searchParams.organization_locations ||
      searchParams.organization_num_employees_ranges ||
      searchParams.organization_ids ||
      searchParams.q_organization_domains_list ||
      searchParams.revenue_range ||
      searchParams.currently_using_all_of_technology_uids ||
      searchParams.currently_using_any_of_technology_uids ||
      searchParams.currently_not_using_any_of_technology_uids ||
      searchParams.q_organization_job_titles ||
      searchParams.organization_job_locations ||
      searchParams.organization_num_jobs_range ||
      searchParams.organization_job_posted_at_range;

    if (!hasSearchCriteria) {
      return NextResponse.json(
        { error: "Please provide at least one search criterion" },
        { status: 400 }
      );
    }

    // Search for organizations
    let response = await apolloClient.searchOrganizations(searchParams);
    let organizations = response.organizations || [];

    // If no results found, try a broader search
    if (organizations.length === 0) {
      console.log(
        "🔄 Apollo Organization Search - No results found, trying broader search..."
      );

      // Create a broader search by focusing on keywords and removing restrictive filters
      const broaderParams = {
        q_keywords: searchParams.q_keywords,
        organization_locations: searchParams.organization_locations,
        page: searchParams.page,
        per_page: searchParams.per_page,
      };

      console.log(
        "🔍 Apollo Organization Search - Broader search params:",
        JSON.stringify(broaderParams, null, 2)
      );

      try {
        response = await apolloClient.searchOrganizations(broaderParams);
        organizations = response.organizations || [];
        console.log(
          `📈 Apollo Organization Search - Broader search found ${organizations.length} organizations`
        );
      } catch (error) {
        console.log(
          "⚠️ Apollo Organization Search - Broader search also failed:",
          error
        );
      }
    }

    // Convert organizations to a format similar to leads for consistency
    const savedOrganizations = [];

    console.log(
      `🏢 Organization search complete. Found ${organizations.length} organizations.`
    );

    // Process each organization
    for (const org of organizations) {
      console.log(`\n📌 Processing organization: ${org.name} (ID: ${org.id})`);
      console.log(`   Industry: ${org.industry}`);
      console.log(`   Employees: ${org.estimated_num_employees}`);
      console.log(`   Location: ${org.city}, ${org.state}, ${org.country}`);

      // Create a lead-like record for the organization
      const organizationRecord = {
        id: org.id,
        apolloId: org.id,
        recordType: "organization",
        name: org.name,
        website: org.website_url,
        domain: org.primary_domain,
        industry: org.industry,
        employeeCount: org.estimated_num_employees,
        location: {
          city: org.city,
          state: org.state,
          country: org.country,
        },
        revenue: org.annual_revenue_printed,
        technologies: org.technology_names,
        foundedYear: org.founded_year,
        publiclyTraded: org.publicly_traded_symbol,
        apolloData: org,
      };

      savedOrganizations.push(organizationRecord);
    }

    console.log(
      `\n✨ Organization search complete. Found ${savedOrganizations.length} organizations.`
    );

    return NextResponse.json({
      success: true,
      organizations: savedOrganizations,
      pagination: response.pagination,
      searchType: "organizations",
    });
  } catch (error) {
    console.error("Apollo organization search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search organizations",
      },
      { status: 500 }
    );
  }
}
