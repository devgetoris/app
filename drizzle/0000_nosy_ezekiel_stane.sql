CREATE TYPE "public"."automation_action" AS ENUM('auto_send', 'manual_review', 'skip');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('draft', 'pending_review', 'approved', 'scheduled', 'sent', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."email_tone" AS ENUM('professional', 'casual', 'friendly', 'formal');--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"conditions" jsonb,
	"action" "automation_action" NOT NULL,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"times_triggered" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"target_criteria" jsonb,
	"tone" "email_tone",
	"total_leads" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"emails_clicked" integer DEFAULT 0,
	"emails_bounced" integer DEFAULT 0,
	"emails_replied" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_data" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"campaign_id" uuid,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"html_body" text,
	"tone" "email_tone",
	"prompt" text,
	"generated_by" varchar(50) DEFAULT 'openai',
	"status" "email_status" DEFAULT 'draft' NOT NULL,
	"auto_approved" boolean DEFAULT false,
	"review_notes" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"replied_at" timestamp,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"resend_email_id" varchar(255),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"apollo_id" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(100),
	"title" varchar(255),
	"seniority" varchar(100),
	"departments" jsonb,
	"company_name" varchar(255),
	"company_domain" varchar(255),
	"company_industry" varchar(255),
	"company_size" varchar(100),
	"company_revenue" varchar(100),
	"company_location" varchar(255),
	"company_city" varchar(255),
	"company_state" varchar(100),
	"company_country" varchar(100),
	"company_funding" varchar(255),
	"company_technologies" jsonb,
	"linkedin_url" text,
	"twitter_url" text,
	"facebook_url" text,
	"github_url" text,
	"employment_history" jsonb,
	"education" jsonb,
	"profile_photo" text,
	"bio" text,
	"keywords" jsonb,
	"fit_score" integer,
	"engagement_score" integer,
	"apollo_data" jsonb,
	"status" varchar(50) DEFAULT 'new',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_apollo_id_unique" UNIQUE("apollo_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"industry" varchar(255),
	"company_size" varchar(100),
	"target_market" text,
	"marketing_goals" jsonb,
	"target_job_titles" jsonb,
	"target_industries" jsonb,
	"target_company_sizes" jsonb,
	"target_locations" jsonb,
	"preferred_tone" "email_tone" DEFAULT 'professional',
	"email_style" text,
	"call_to_action_types" jsonb,
	"email_signature" text,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;