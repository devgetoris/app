import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getApolloClient } from "@/lib/apollo";
import { db } from "@/db";
import { leads } from "@/db/schema";
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

    const body = await request.json();
    const { leadId, email, apolloId } = body;

    const apolloClient = getApolloClient();
    
    let contact;
    
    // Enrich by Apollo ID or email
    if (apolloId) {
      const response = await apolloClient.getContactById(apolloId);
      contact = response.person;
    } else if (email) {
      const response = await apolloClient.enrichContact(email);
      contact = response.person;
    } else {
      return NextResponse.json(
        { error: "Either leadId, apolloId, or email is required" },
        { status: 400 }
      );
    }

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Update lead in database if leadId provided
    if (leadId) {
      await db.update(leads)
        .set({
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
          
          // Store full Apollo data
          apolloData: contact,
          
          updatedAt: new Date(),
        })
        .where(eq(leads.id, leadId));
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Apollo enrich error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enrich lead" },
      { status: 500 }
    );
  }
}


