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
      // Basic search
      keywords,
      
      // People search parameters
      person_titles,
      person_seniorities,
      person_locations,
      include_similar_titles,
      contact_email_status,
      
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
    
    // People search parameters
    if (person_titles && Array.isArray(person_titles) && person_titles.length > 0) {
      searchParams.person_titles = person_titles;
    }
    
    if (person_seniorities && Array.isArray(person_seniorities) && person_seniorities.length > 0) {
      searchParams.person_seniorities = person_seniorities;
    }
    
    if (person_locations && Array.isArray(person_locations) && person_locations.length > 0) {
      // Apollo API limits array parameters, cap at 10 items
      const limitedLocations = person_locations.slice(0, 10);
      if (person_locations.length > 10) {
        console.log(
          `⚠️ Person location limit: Apollo limits to 10 locations. Limiting from ${person_locations.length} to 10.`
        );
      }
      searchParams.person_locations = limitedLocations;
    }
    
    if (include_similar_titles !== undefined) {
      searchParams.include_similar_titles = include_similar_titles;
    }
    
    if (contact_email_status && Array.isArray(contact_email_status) && contact_email_status.length > 0) {
      searchParams.contact_email_status = contact_email_status;
    }
    
    // Organization search parameters
    if (organization_locations && Array.isArray(organization_locations) && organization_locations.length > 0) {
      const limitedOrgLocations = organization_locations.slice(0, 10);
      if (organization_locations.length > 10) {
        console.log(
          `⚠️ Organization location limit: Apollo limits to 10 locations. Limiting from ${organization_locations.length} to 10.`
        );
      }
      searchParams.organization_locations = limitedOrgLocations;
    }
    
    if (organization_num_employees_ranges && Array.isArray(organization_num_employees_ranges) && organization_num_employees_ranges.length > 0) {
      searchParams.organization_num_employees_ranges = organization_num_employees_ranges;
    }
    
    if (organization_ids && Array.isArray(organization_ids) && organization_ids.length > 0) {
      searchParams.organization_ids = organization_ids;
    }
    
    if (q_organization_domains_list && Array.isArray(q_organization_domains_list) && q_organization_domains_list.length > 0) {
      searchParams.q_organization_domains_list = q_organization_domains_list;
    }
    
    if (revenue_range && (revenue_range.min !== undefined || revenue_range.max !== undefined)) {
      searchParams.revenue_range = {};
      if (revenue_range.min !== undefined) {
        searchParams.revenue_range.min = revenue_range.min;
      }
      if (revenue_range.max !== undefined) {
        searchParams.revenue_range.max = revenue_range.max;
      }
    }
    
    // Technology filters
    if (currently_using_all_of_technology_uids && Array.isArray(currently_using_all_of_technology_uids) && currently_using_all_of_technology_uids.length > 0) {
      searchParams.currently_using_all_of_technology_uids = currently_using_all_of_technology_uids;
    }
    
    if (currently_using_any_of_technology_uids && Array.isArray(currently_using_any_of_technology_uids) && currently_using_any_of_technology_uids.length > 0) {
      searchParams.currently_using_any_of_technology_uids = currently_using_any_of_technology_uids;
    }
    
    if (currently_not_using_any_of_technology_uids && Array.isArray(currently_not_using_any_of_technology_uids) && currently_not_using_any_of_technology_uids.length > 0) {
      searchParams.currently_not_using_any_of_technology_uids = currently_not_using_any_of_technology_uids;
    }
    
    // Job posting filters
    if (q_organization_job_titles && Array.isArray(q_organization_job_titles) && q_organization_job_titles.length > 0) {
      searchParams.q_organization_job_titles = q_organization_job_titles;
    }
    
    if (organization_job_locations && Array.isArray(organization_job_locations) && organization_job_locations.length > 0) {
      searchParams.organization_job_locations = organization_job_locations;
    }
    
    if (organization_num_jobs_range && (organization_num_jobs_range.min !== undefined || organization_num_jobs_range.max !== undefined)) {
      searchParams.organization_num_jobs_range = {};
      if (organization_num_jobs_range.min !== undefined) {
        searchParams.organization_num_jobs_range.min = organization_num_jobs_range.min;
      }
      if (organization_num_jobs_range.max !== undefined) {
        searchParams.organization_num_jobs_range.max = organization_num_jobs_range.max;
      }
    }
    
    if (organization_job_posted_at_range && (organization_job_posted_at_range.min || organization_job_posted_at_range.max)) {
      searchParams.organization_job_posted_at_range = {};
      if (organization_job_posted_at_range.min) {
        searchParams.organization_job_posted_at_range.min = organization_job_posted_at_range.min;
      }
      if (organization_job_posted_at_range.max) {
        searchParams.organization_job_posted_at_range.max = organization_job_posted_at_range.max;
      }
    }

    // Log the search parameters for debugging
    console.log("Apollo Search Params:", JSON.stringify(searchParams, null, 2));
    
    // Validate that we have at least one search criterion
    const hasSearchCriteria = 
      searchParams.q_keywords ||
      searchParams.person_titles ||
      searchParams.person_seniorities ||
      searchParams.person_locations ||
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

      // Process each contact in batch individually by ID (more reliable than bulk_match)
      let enrichedBatch: any[] = [];
      
      for (const contact of batch) {
        try {
          console.log(`🔧 Enriching by Apollo ID: ${contact.id}`);
          const response = await apolloClient.getContactById(contact.id);
          enrichedBatch.push(response.person);
        } catch (error) {
          console.log(`⚠️ Failed to enrich ${contact.first_name} ${contact.last_name} (${contact.id}), using search data: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Fallback to search data
          enrichedBatch.push(contact);
        }
      }

      console.log(`✅ Batch enrichment complete. Enriched ${enrichedBatch.length} of ${batch.length} contacts`);

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

          // Return the enriched data for display
          savedLeads.push({
            ...newLead,
            // Ensure we have the enriched email and other data
            email: enrichedContact.email,
            firstName: enrichedContact.first_name,
            lastName: enrichedContact.last_name,
            title: enrichedContact.title,
            companyName: enrichedContact.organization?.name,
            linkedinUrl: enrichedContact.linkedin_url,
            profilePhoto: enrichedContact.photo_url,
            bio: enrichedContact.headline,
            recordType: "individual",
          });
        } else {
          console.log(`   ℹ️ Lead already exists in database`);
          // Return the existing lead with enriched data
          savedLeads.push({
            ...existingLead,
            // Ensure we have the enriched email and other data
            email: enrichedContact.email,
            firstName: enrichedContact.first_name,
            lastName: enrichedContact.last_name,
            title: enrichedContact.title,
            companyName: enrichedContact.organization?.name,
            linkedinUrl: enrichedContact.linkedin_url,
            profilePhoto: enrichedContact.photo_url,
            bio: enrichedContact.headline,
            recordType: "individual",
          });
        }
      }
    }

    console.log(`\n✨ Search complete. Saved ${savedLeads.length} leads.`);
    
    // Log the first few leads to debug the data structure
    if (savedLeads.length > 0) {
      console.log("📋 Sample lead data being returned:", JSON.stringify(savedLeads[0], null, 2));
    }

    // Return the enriched leads data instead of original search results
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

