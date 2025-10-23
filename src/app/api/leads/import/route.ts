import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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
    const { selectedResults, searchType } = body;

    if (!selectedResults || !Array.isArray(selectedResults) || selectedResults.length === 0) {
      return NextResponse.json(
        { error: "No results selected for import" },
        { status: 400 }
      );
    }

    const importedLeads = [];

    for (const result of selectedResults) {
      // Check if lead already exists for this user
      const existingLead = await db.query.leads.findFirst({
        where: eq(leads.apolloId, result.apolloId),
      });

      if (!existingLead) {
        console.log(`💾 Importing lead: ${result.firstName} ${result.lastName} (ID: ${result.apolloId})`);
        
        const [newLead] = await db.insert(leads).values({
          userId: user.id,
          apolloId: result.apolloId,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
          title: result.title,
          seniority: result.seniority,
          departments: result.departments,
          
          // Company info
          companyName: result.companyName,
          companyDomain: result.companyDomain,
          companyIndustry: result.companyIndustry,
          companySize: result.companySize,
          companyRevenue: result.companyRevenue,
          companyLocation: result.companyLocation,
          companyCity: result.companyCity,
          companyState: result.companyState,
          companyCountry: result.companyCountry,
          companyFunding: result.companyFunding,
          companyTechnologies: result.companyTechnologies,
          
          // Social profiles
          linkedinUrl: result.linkedinUrl,
          twitterUrl: result.twitterUrl,
          facebookUrl: result.facebookUrl,
          githubUrl: result.githubUrl,
          
          // Additional data
          profilePhoto: result.profilePhoto,
          bio: result.bio,
          employmentHistory: result.employmentHistory,
          education: result.education,
          
          // Store full Apollo data for reference
          apolloData: result.apolloData,
          
          // Initial status
          status: "new",
        }).returning();

        importedLeads.push(newLead);
      } else {
        console.log(`ℹ️ Lead already exists: ${result.firstName} ${result.lastName}`);
        importedLeads.push(existingLead);
      }
    }

    console.log(`✨ Import complete. Imported ${importedLeads.length} leads.`);

    return NextResponse.json({
      success: true,
      imported: importedLeads.length,
      leads: importedLeads,
    });
  } catch (error) {
    console.error("Lead import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import leads" },
      { status: 500 }
    );
  }
}
