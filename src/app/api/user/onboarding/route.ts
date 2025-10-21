import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
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
    const {
      companyName,
      industry,
      companySize,
      targetMarket,
      marketingGoals,
      targetJobTitles,
      targetIndustries,
      targetCompanySizes,
      targetLocations,
      preferredTone,
      emailStyle,
      callToActionTypes,
      emailSignature,
    } = body;

    // Get user email from Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    const email = clerkUser.email_addresses?.[0]?.email_address || "";

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (existingUser) {
      // Update existing user
      await db.update(users)
        .set({
          companyName,
          industry,
          companySize,
          targetMarket,
          marketingGoals,
          targetJobTitles,
          targetIndustries,
          targetCompanySizes,
          targetLocations,
          preferredTone,
          emailStyle,
          callToActionTypes,
          emailSignature,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      return NextResponse.json({
        success: true,
        user: existingUser,
      });
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        clerkId: userId,
        email,
        companyName,
        industry,
        companySize,
        targetMarket,
        marketingGoals,
        targetJobTitles,
        targetIndustries,
        targetCompanySizes,
        targetLocations,
        preferredTone,
        emailStyle,
        callToActionTypes,
        emailSignature,
        onboardingCompleted: true,
      }).returning();

      return NextResponse.json({
        success: true,
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}


