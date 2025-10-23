import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails } from "@/db/schema";
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
    const { emailId, subject, body: emailBody, status } = body;

    if (!emailId) {
      return NextResponse.json(
        { error: "Email ID is required" },
        { status: 400 }
      );
    }

    // Get email
    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
    });

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Update email
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (subject !== undefined) updateData.subject = subject;
    if (emailBody !== undefined) {
      updateData.body = emailBody;
      // Also update HTML body with simple formatting
      updateData.htmlBody = emailBody.replace(/\n/g, "<br>");
    }
    if (status !== undefined) updateData.status = status;

    await db.update(emails)
      .set(updateData)
      .where(eq(emails.id, emailId));

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update email" },
      { status: 500 }
    );
  }
}




