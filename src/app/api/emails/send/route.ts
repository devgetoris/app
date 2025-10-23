import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getResendService } from "@/lib/resend";
import { db } from "@/db";
import { emails, leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailId, scheduledAt } = body;

    // Get email
    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Get lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, email.leadId),
    });

    if (!lead || !lead.email) {
      return NextResponse.json(
        { error: "Lead email not found" },
        { status: 404 }
      );
    }

    // If scheduled for later, just update the status
    if (scheduledAt) {
      await db
        .update(emails)
        .set({
          status: "scheduled",
          scheduledAt: new Date(scheduledAt),
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId));

      return NextResponse.json({
        success: true,
        message: "Email scheduled successfully",
      });
    }

    // Send email immediately
    const resendService = getResendService();

    try {
      const response = await resendService.sendEmail({
        to: lead.email,
        subject: email.subject,
        html: email.htmlBody || email.body,
        text: email.body,
      });

      // Update email status
      await db
        .update(emails)
        .set({
          status: "sent",
          sentAt: new Date(),
          resendEmailId: response.id,
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId));

      // Update lead status
      await db
        .update(leads)
        .set({
          status: "contacted",
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      return NextResponse.json({
        success: true,
        resendId: response.id,
      });
    } catch (sendError) {
      // Update email with error
      await db
        .update(emails)
        .set({
          status: "failed",
          errorMessage:
            sendError instanceof Error ? sendError.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId));

      throw sendError;
    }
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
