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
      // Validate required fields
      if (!result.apolloId && !result.id) {
        console.log(`⚠️ Skipping result without valid ID:`, result);
        continue;
      }

      const apolloId = result.apolloId || result.id;
      
      // Check if lead already exists for this user
      const existingLead = await db.query.leads.findFirst({
        where: eq(leads.apolloId, apolloId),
      });

      if (!existingLead) {
        const recordType = searchType === "organizations" ? "organization" : "individual";
        const displayName = searchType === "organizations" 
          ? result.name || result.companyName 
          : `${result.firstName || ''} ${result.lastName || ''}`.trim();
        
        console.log(`💾 Importing ${recordType}: ${displayName} (ID: ${apolloId})`);
        
        const [newLead] = await db.insert(leads).values({
          userId: user.id,
          recordType: recordType,
          apolloId: apolloId,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
          title: result.title,
          seniority: result.seniority,
          departments: result.departments,
          
          // Company info - handle both individual and organization records
          companyName: searchType === "organizations" ? result.name : result.companyName,
          companyDomain: searchType === "organizations" ? result.domain : result.companyDomain,
          companyIndustry: searchType === "organizations" ? result.industry : result.companyIndustry,
          companySize: searchType === "organizations" ? (result.employeeCount ? String(result.employeeCount) : null) : result.companySize,
          companyRevenue: searchType === "organizations" ? result.revenue : result.companyRevenue,
          companyLocation: searchType === "organizations" ? 
            `${result.location?.city || ''}, ${result.location?.state || ''}, ${result.location?.country || ''}`.replace(/^,\s*|,\s*$/g, '') : 
            result.companyLocation,
          companyCity: searchType === "organizations" ? result.location?.city : result.companyCity,
          companyState: searchType === "organizations" ? result.location?.state : result.companyState,
          companyCountry: searchType === "organizations" ? result.location?.country : result.companyCountry,
          companyFunding: searchType === "organizations" ? result.publiclyTraded : result.companyFunding,
          companyTechnologies: searchType === "organizations" ? result.technologies : result.companyTechnologies,
          
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
          apolloData: result.apolloData || result,
          
          // Initial status
          status: "new",
        }).returning();

        importedLeads.push(newLead);
      } else {
        const displayName = searchType === "organizations" 
          ? result.name || result.companyName 
          : `${result.firstName || ''} ${result.lastName || ''}`.trim();
        console.log(`ℹ️ Lead already exists: ${displayName}`);
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
