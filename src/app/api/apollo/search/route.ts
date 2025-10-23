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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
    // According to docs: person_titles[] parameter
    if (jobTitles && Array.isArray(jobTitles) && jobTitles.length > 0) {
      searchParams.person_titles = jobTitles;
    }
    
    // Industries - Note: Apollo docs don't have a direct industry filter
    // We can use q_keywords to include industry terms in search
    // Removed q_organization_keyword_tags as it's not in official docs
    if (industries && Array.isArray(industries) && industries.length > 0) {
      console.log("⚠️ Industries filter: Adding to keywords instead (no direct industry filter in API)");
      // Add industries to keywords
      if (searchParams.q_keywords) {
        searchParams.q_keywords += " " + industries.join(" ");
      } else {
        searchParams.q_keywords = industries.join(" ");
      }
    }
    
    // Company Sizes - Apollo accepts organization_num_employees_ranges
    // Format should be "1,10" or "1000,5000" etc
    if (companySizes && Array.isArray(companySizes) && companySizes.length > 0) {
      searchParams.organization_num_employees_ranges = companySizes;
    }
    
    // Locations - Apollo accepts person_locations for where people LIVE
    // and organization_locations for company HQ location
    // We'll use person_locations for general location searches
    // IMPORTANT: Apollo has a limit on array parameter sizes (typically 5-10 items)
    if (locations && Array.isArray(locations) && locations.length > 0) {
      // Apollo API limits array parameters, cap at 10 items
      const limitedLocations = locations.slice(0, 10);
      if (locations.length > 10) {
        console.log(
          `⚠️ Location limit: Apollo limits to 10 locations. Limiting from ${locations.length} to 10.`
        );
      }
      searchParams.person_locations = limitedLocations;
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
    
    // Prepare contacts for bulk enrichment (batch in groups of 10)
    const allContacts = response.people || response.contacts || [];
    const contactBatches: Array<typeof allContacts> = [];
    
    for (let i = 0; i < allContacts.length; i += 10) {
      contactBatches.push(allContacts.slice(i, i + 10));
    }

    console.log(`📦 Bulk Enrichment - Processing ${allContacts.length} contacts in ${contactBatches.length} batch(es)`);

    // Process each batch with bulk enrichment
    for (let batchIdx = 0; batchIdx < contactBatches.length; batchIdx++) {
      const batch = contactBatches[batchIdx];
      console.log(`\n📥 Batch ${batchIdx + 1}/${contactBatches.length} - Enriching ${batch.length} contacts...`);

      // Prepare details for bulk enrichment
      const bulkDetails = batch.map(contact => ({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        linkedin_url: contact.linkedin_url,
        organization_name: contact.organization?.name,
      }));

      // Enrich all contacts in this batch with a single API call
      let enrichedBatch: any[] = [];
      try {
        const bulkResponse = await apolloClient.bulkEnrichContacts(bulkDetails);
        
        if (bulkResponse.enriched_data) {
          enrichedBatch = bulkResponse.enriched_data.map(item => item.person);
        } else {
          // Fallback to original contacts if no enriched data
          enrichedBatch = batch;
        }
      } catch (error) {
        console.log(`⚠️ Batch ${batchIdx + 1} bulk enrichment failed, using search data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        enrichedBatch = batch;
      }

      // Process each enriched contact
      for (let contactIdx = 0; contactIdx < enrichedBatch.length; contactIdx++) {
        const enrichedContact = enrichedBatch[contactIdx];
        const originalContact = batch[contactIdx];

        console.log(`\n📌 Processing contact: ${enrichedContact.first_name} ${enrichedContact.last_name} (ID: ${originalContact.id})`);
        console.log(`   Initial email from search: ${originalContact.email || 'NO EMAIL'}`);
        console.log(`   ✅ Enrichment successful. Email: ${enrichedContact.email || 'NO EMAIL'}`);
        console.log(`   ℹ️ Email status: ${enrichedContact.email || 'NO EMAIL'}`);

        // Check if lead already exists for this user
        const existingLead = await db.query.leads.findFirst({
          where: eq(leads.apolloId, originalContact.id),
        });

        if (!existingLead) {
          console.log(`   💾 Saving new lead with email: ${enrichedContact.email}`);
          const [newLead] = await db.insert(leads).values({
            userId: user.id,
            apolloId: originalContact.id,
            firstName: enrichedContact.first_name,
            lastName: enrichedContact.last_name,
            email: enrichedContact.email,
            phone: enrichedContact.phone_numbers?.[0]?.sanitized_number,
            title: enrichedContact.title,
            seniority: enrichedContact.seniority,
            departments: enrichedContact.departments,
            
            // Company info - handle missing data gracefully
            companyName: enrichedContact.organization?.name,
            companyDomain: enrichedContact.organization?.primary_domain,
            companyIndustry: enrichedContact.organization?.industry,
            companySize: enrichedContact.organization?.estimated_num_employees 
              ? String(enrichedContact.organization.estimated_num_employees) 
              : null,
            companyRevenue: enrichedContact.organization?.annual_revenue_printed,
            companyLocation: enrichedContact.organization?.raw_address,
            companyCity: enrichedContact.organization?.city,
            companyState: enrichedContact.organization?.state,
            companyCountry: enrichedContact.organization?.country,
            companyFunding: enrichedContact.organization?.publicly_traded_symbol,
            companyTechnologies: enrichedContact.organization?.technology_names,
            
            // Social profiles
            linkedinUrl: enrichedContact.linkedin_url,
            twitterUrl: enrichedContact.twitter_url,
            facebookUrl: enrichedContact.facebook_url,
            githubUrl: enrichedContact.github_url,
            
            // Additional data
            profilePhoto: enrichedContact.photo_url,
            bio: enrichedContact.headline,
            employmentHistory: enrichedContact.employment_history?.map((job: any) => ({
              title: job.title || "",
              company: job.organization_name || "",
              startDate: job.start_date,
              endDate: job.end_date,
              current: job.current,
            })),
            education: enrichedContact.education?.map((edu: any) => ({
              school: edu.organization_name || "",
              degree: edu.degree,
              field: edu.major,
              startDate: edu.start_date,
              endDate: edu.end_date,
            })),
            
            // Store full Apollo data for reference
            apolloData: enrichedContact,
            
            // Initial status
            status: "new",
          }).returning();

          savedLeads.push(newLead);
        } else {
          console.log(`   ℹ️ Lead already exists in database`);
          // Add existing leads regardless of email status
          savedLeads.push(existingLead);
        }
      }
    }

    console.log(`\n✨ Search complete. Saved ${savedLeads.length} leads.`);

    return NextResponse.json({
      success: true,
      leads: savedLeads,
      pagination: response.pagination,
    });
  } catch (error) {
    console.error("Apollo search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search leads" },
      { status: 500 }
    );
  }
}


