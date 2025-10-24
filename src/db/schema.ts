import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  varchar,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const emailStatusEnum = pgEnum("email_status", [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "sent",
  "failed",
  "bounced",
]);

export const emailToneEnum = pgEnum("email_tone", [
  "professional",
  "casual",
  "friendly",
  "formal",
]);

export const automationActionEnum = pgEnum("automation_action", [
  "auto_send",
  "manual_review",
  "skip",
]);

// Users table - extends Clerk user data with our app-specific preferences
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),

  // Onboarding data
  companyName: varchar("company_name", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  companySize: varchar("company_size", { length: 100 }),
  targetMarket: text("target_market"),

  // Marketing goals
  marketingGoals: jsonb("marketing_goals").$type<string[]>(),

  // Target audience criteria
  targetJobTitles: jsonb("target_job_titles").$type<string[]>(),
  targetIndustries: jsonb("target_industries").$type<string[]>(),
  targetCompanySizes: jsonb("target_company_sizes").$type<string[]>(),
  targetLocations: jsonb("target_locations").$type<string[]>(),

  // Email preferences
  preferredTone: emailToneEnum("preferred_tone").default("professional"),
  emailStyle: text("email_style"),
  callToActionTypes: jsonb("call_to_action_types").$type<string[]>(),
  emailSignature: text("email_signature"),

  // Settings
  onboardingCompleted: boolean("onboarding_completed").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads table - stores data from Apollo API
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  // Record type - individual or organization
  recordType: varchar("record_type", { length: 20 }).default("individual"), // individual, organization

  // Basic contact info
  apolloId: varchar("apollo_id", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 100 }),

  // Current position
  title: varchar("title", { length: 255 }),
  seniority: varchar("seniority", { length: 100 }),
  departments: jsonb("departments").$type<string[]>(),

  // Company information
  companyName: varchar("company_name", { length: 255 }),
  companyDomain: varchar("company_domain", { length: 255 }),
  companyIndustry: varchar("company_industry", { length: 255 }),
  companySize: varchar("company_size", { length: 100 }),
  companyRevenue: varchar("company_revenue", { length: 100 }),
  companyLocation: varchar("company_location", { length: 255 }),
  companyCity: varchar("company_city", { length: 255 }),
  companyState: varchar("company_state", { length: 100 }),
  companyCountry: varchar("company_country", { length: 100 }),
  companyFunding: varchar("company_funding", { length: 255 }),
  companyTechnologies: jsonb("company_technologies").$type<string[]>(),

  // Social profiles
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  facebookUrl: text("facebook_url"),
  githubUrl: text("github_url"),

  // Employment history
  employmentHistory: jsonb("employment_history").$type<
    Array<{
      title: string;
      company: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }>
  >(),

  // Education
  education: jsonb("education").$type<
    Array<{
      school: string;
      degree?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
    }>
  >(),

  // Additional data
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
  keywords: jsonb("keywords").$type<string[]>(),

  // Scoring
  fitScore: integer("fit_score"),
  engagementScore: integer("engagement_score"),

  // Full Apollo API response (for reference)
  apolloData: jsonb("apollo_data"),

  // Status
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, replied, converted, unsubscribed
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Campaign settings
  targetCriteria: jsonb("target_criteria"),
  tone: emailToneEnum("tone"),

  // Stats
  totalLeads: integer("total_leads").default(0),
  emailsSent: integer("emails_sent").default(0),
  emailsOpened: integer("emails_opened").default(0),
  emailsClicked: integer("emails_clicked").default(0),
  emailsBounced: integer("emails_bounced").default(0),
  emailsReplied: integer("emails_replied").default(0),

  // Status
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Emails
export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  leadId: uuid("lead_id")
    .references(() => leads.id)
    .notNull(),
  campaignId: uuid("campaign_id").references(() => emailCampaigns.id),

  // Email content
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  htmlBody: text("html_body"),

  // Generation metadata
  tone: emailToneEnum("tone"),
  prompt: text("prompt"),
  generatedBy: varchar("generated_by", { length: 50 }).default("openai"), // openai, manual

  // Status and workflow
  status: emailStatusEnum("status").default("draft").notNull(),

  // Automation decision
  autoApproved: boolean("auto_approved").default(false),
  reviewNotes: text("review_notes"),

  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),

  // Engagement tracking
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  bouncedAt: timestamp("bounced_at"),
  repliedAt: timestamp("replied_at"),

  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),

  // Resend metadata
  resendEmailId: varchar("resend_email_id", { length: 255 }),

  // Error handling
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Automation rules
export const automationRules = pgTable("automation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Rule conditions (evaluated as AND)
  conditions: jsonb("conditions").$type<
    Array<{
      field: string;
      operator: string;
      value: any;
    }>
  >(),

  // Action to take
  action: automationActionEnum("action").notNull(),

  // Priority (higher number = higher priority)
  priority: integer("priority").default(0),

  // Status
  isActive: boolean("is_active").default(true),

  // Stats
  timesTriggered: integer("times_triggered").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email events (for detailed tracking)
export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailId: uuid("email_id")
    .references(() => emails.id)
    .notNull(),

  eventType: varchar("event_type", { length: 50 }).notNull(), // sent, delivered, opened, clicked, bounced, complained, unsubscribed
  eventData: jsonb("event_data"),

  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
