import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Resend webhook payload structure:
    // { type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained',
    //   data: { email_id: string, ... } }

    const resendEmailId = data.email_id;

    // Find email by Resend email ID
    const email = await db.query.emails.findFirst({
      where: eq(emails.resendEmailId, resendEmailId),
    });

    if (!email) {
      console.warn(`Email not found for Resend ID: ${resendEmailId}`);
      return NextResponse.json({ success: true });
    }

    // Log the event
    await db.insert(emailEvents).values({
      emailId: email.id,
      eventType: type.replace("email.", ""),
      eventData: data,
    });

    // Update email based on event type
    const updateData: any = {
      updatedAt: new Date(),
    };

    switch (type) {
      case "email.delivered":
        updateData.deliveredAt = new Date();
        break;

      case "email.opened":
        if (!email.openedAt) {
          updateData.openedAt = new Date();
        }
        updateData.openCount = (email.openCount || 0) + 1;
        break;

      case "email.clicked":
        if (!email.clickedAt) {
          updateData.clickedAt = new Date();
        }
        updateData.clickCount = (email.clickCount || 0) + 1;
        break;

      case "email.bounced":
        updateData.status = "bounced";
        updateData.bouncedAt = new Date();
        break;

      case "email.complained":
        // Handle spam complaints
        updateData.status = "failed";
        updateData.errorMessage = "Spam complaint received";
        break;
    }

    await db.update(emails).set(updateData).where(eq(emails.id, email.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}




