import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOpenAIService } from "@/lib/openai";
import { applyAutomationToEmail } from "@/lib/automation";
import { db } from "@/db";
import { emails, leads, users } from "@/db/schema";
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
    const { leadId, campaignId, tone, customPrompt, saveAsDraft = true } = body;

    // Get lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const openAIService = getOpenAIService();

    // Generate email
    const generatedEmail = await openAIService.generateEmail({
      leadName: `${lead.firstName} ${lead.lastName}`,
      leadTitle: lead.title || "",
      leadCompany: lead.companyName || "",
      leadIndustry: lead.companyIndustry || undefined,
      leadBio: lead.bio || undefined,
      leadEmploymentHistory: lead.employmentHistory || undefined,

      userCompany: user.companyName || undefined,
      userIndustry: user.industry || undefined,
      userGoals: user.marketingGoals || undefined,
      tone: tone || user.preferredTone,
      customPrompt,
    });

    // Save email to database if requested
    if (saveAsDraft) {
      const [newEmail] = await db
        .insert(emails)
        .values({
          userId: user.id,
          leadId: lead.id,
          campaignId,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          htmlBody: generatedEmail.htmlBody,
          tone: tone || user.preferredTone,
          prompt: customPrompt,
          status: "draft",
          autoApproved: false,
        })
        .returning();

      // Apply automation rules to determine if should auto-approve
      await applyAutomationToEmail(newEmail.id, user.id, lead.id);

      // Fetch the updated email with automation decision
      const updatedEmail = await db.query.emails.findFirst({
        where: eq(emails.id, newEmail.id),
      });

      return NextResponse.json({
        success: true,
        email: updatedEmail,
      });
    }

    return NextResponse.json({
      success: true,
      email: generatedEmail,
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate email",
      },
      { status: 500 }
    );
  }
}
