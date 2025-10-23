import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, automationRules } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all automation rules for a user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const rules = await db.query.automationRules.findMany({
      where: eq(automationRules.userId, user.id),
      orderBy: (rules, { desc }) => [desc(rules.priority)],
    });

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error) {
    console.error("Get automation rules error:", error);
    return NextResponse.json(
      { error: "Failed to get automation rules" },
      { status: 500 }
    );
  }
}

// POST create a new automation rule
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
    const { name, description, conditions, action, priority, isActive } = body;

    const [newRule] = await db.insert(automationRules).values({
      userId: user.id,
      name,
      description,
      conditions,
      action,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return NextResponse.json({
      success: true,
      rule: newRule,
    });
  } catch (error) {
    console.error("Create automation rule error:", error);
    return NextResponse.json(
      { error: "Failed to create automation rule" },
      { status: 500 }
    );
  }
}

// PUT update an automation rule
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ruleId, name, description, conditions, action, priority, isActive } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (action !== undefined) updateData.action = action;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(automationRules)
      .set(updateData)
      .where(eq(automationRules.id, ruleId));

    return NextResponse.json({
      success: true,
      message: "Automation rule updated successfully",
    });
  } catch (error) {
    console.error("Update automation rule error:", error);
    return NextResponse.json(
      { error: "Failed to update automation rule" },
      { status: 500 }
    );
  }
}

// DELETE an automation rule
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 }
      );
    }

    await db.delete(automationRules)
      .where(eq(automationRules.id, ruleId));

    return NextResponse.json({
      success: true,
      message: "Automation rule deleted successfully",
    });
  } catch (error) {
    console.error("Delete automation rule error:", error);
    return NextResponse.json(
      { error: "Failed to delete automation rule" },
      { status: 500 }
    );
  }
}




