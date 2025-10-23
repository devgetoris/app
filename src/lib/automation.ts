import { db } from "@/db";
import { automationRules, leads, emails } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface Lead {
  id: string;
  seniority?: string | null;
  title?: string | null;
  companySize?: string | null;
  companyIndustry?: string | null;
  departments?: string[] | null;
  fitScore?: number | null;
}

interface AutomationRule {
  id: string;
  action: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }> | null;
  priority: number | null;
  isActive: boolean | null;
}

/**
 * Evaluate a lead against automation rules to determine if it should be auto-approved
 */
export async function evaluateLead(
  userId: string,
  lead: Lead
): Promise<{
  shouldAutoApprove: boolean;
  matchedRule?: AutomationRule;
  reason?: string;
}> {
  // Get all active automation rules for the user, ordered by priority
  const rules = await db.query.automationRules.findMany({
    where: and(
      eq(automationRules.userId, userId),
      eq(automationRules.isActive, true)
    ),
    orderBy: (rules, { desc }) => [desc(rules.priority)],
  });

  // If no rules, default to manual review
  if (rules.length === 0) {
    return {
      shouldAutoApprove: false,
      reason: "No automation rules defined",
    };
  }

  // Evaluate each rule in order of priority
  for (const rule of rules) {
    const matchesRule = evaluateRuleConditions(lead, rule.conditions || []);

    if (matchesRule) {
      // Update rule trigger count
      await db
        .update(automationRules)
        .set({
          timesTriggered: (rule.timesTriggered || 0) + 1,
        })
        .where(eq(automationRules.id, rule.id));

      return {
        shouldAutoApprove: rule.action === "auto_send",
        matchedRule: rule,
        reason:
          rule.action === "auto_send"
            ? `Matched rule: ${rule.name}`
            : `Rule requires manual review: ${rule.name}`,
      };
    }
  }

  // No rules matched, default to manual review
  return {
    shouldAutoApprove: false,
    reason: "No matching automation rules",
  };
}

/**
 * Evaluate if a lead matches all conditions in a rule
 */
function evaluateRuleConditions(
  lead: Lead,
  conditions: Array<{ field: string; operator: string; value: any }>
): boolean {
  // All conditions must be true (AND logic)
  return conditions.every(condition => {
    const leadValue = getLeadFieldValue(lead, condition.field);
    return evaluateCondition(leadValue, condition.operator, condition.value);
  });
}

/**
 * Get a field value from a lead object
 */
function getLeadFieldValue(lead: Lead, field: string): any {
  switch (field) {
    case "seniority":
      return lead.seniority;
    case "title":
      return lead.title;
    case "companySize":
      return lead.companySize;
    case "companyIndustry":
      return lead.companyIndustry;
    case "departments":
      return lead.departments;
    case "fitScore":
      return lead.fitScore;
    default:
      return null;
  }
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(
  leadValue: any,
  operator: string,
  ruleValue: any
): boolean {
  switch (operator) {
    case "equals":
      return leadValue === ruleValue;

    case "not_equals":
      return leadValue !== ruleValue;

    case "contains":
      if (typeof leadValue === "string") {
        return leadValue.toLowerCase().includes(ruleValue.toLowerCase());
      }
      if (Array.isArray(leadValue)) {
        return leadValue.some(v =>
          v.toLowerCase().includes(ruleValue.toLowerCase())
        );
      }
      return false;

    case "not_contains":
      if (typeof leadValue === "string") {
        return !leadValue.toLowerCase().includes(ruleValue.toLowerCase());
      }
      if (Array.isArray(leadValue)) {
        return !leadValue.some(v =>
          v.toLowerCase().includes(ruleValue.toLowerCase())
        );
      }
      return true;

    case "in":
      if (Array.isArray(ruleValue)) {
        return ruleValue.includes(leadValue);
      }
      return false;

    case "not_in":
      if (Array.isArray(ruleValue)) {
        return !ruleValue.includes(leadValue);
      }
      return true;

    case "greater_than":
      return Number(leadValue) > Number(ruleValue);

    case "less_than":
      return Number(leadValue) < Number(ruleValue);

    case "greater_than_or_equal":
      return Number(leadValue) >= Number(ruleValue);

    case "less_than_or_equal":
      return Number(leadValue) <= Number(ruleValue);

    default:
      return false;
  }
}

/**
 * Apply automation to an email after generation
 */
export async function applyAutomationToEmail(
  emailId: string,
  userId: string,
  leadId: string
): Promise<void> {
  // Get the lead
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, leadId),
  });

  if (!lead) {
    return;
  }

  // Evaluate the lead
  const evaluation = await evaluateLead(userId, lead);

  // Update the email with automation decision
  const updateData: any = {
    autoApproved: evaluation.shouldAutoApprove,
    reviewNotes: evaluation.reason,
    updatedAt: new Date(),
  };

  if (evaluation.shouldAutoApprove) {
    updateData.status = "approved";
  } else {
    updateData.status = "pending_review";
  }

  await db.update(emails).set(updateData).where(eq(emails.id, emailId));
}

/**
 * Create a default automation rule for a user
 */
export async function createDefaultAutomationRule(
  userId: string
): Promise<void> {
  // Check if user already has rules
  const existingRules = await db.query.automationRules.findMany({
    where: eq(automationRules.userId, userId),
  });

  if (existingRules.length > 0) {
    return; // User already has rules
  }

  // Create a default rule: auto-send to non-C-level executives
  await db.insert(automationRules).values({
    userId,
    name: "Auto-send to non-executives",
    description:
      "Automatically send emails to leads who are not C-level executives",
    conditions: [
      {
        field: "seniority",
        operator: "not_in",
        value: ["C-Level", "Owner", "Founder", "Partner"],
      },
    ],
    action: "auto_send",
    priority: 1,
    isActive: false, // Disabled by default for safety
  });

  // Create another rule: manual review for C-level
  await db.insert(automationRules).values({
    userId,
    name: "Manual review for executives",
    description: "Require manual review for C-level executives",
    conditions: [
      {
        field: "seniority",
        operator: "in",
        value: ["C-Level", "Owner", "Founder", "Partner"],
      },
    ],
    action: "manual_review",
    priority: 10, // Higher priority
    isActive: true,
  });
}




