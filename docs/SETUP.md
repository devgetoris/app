# LeadFlow Setup Guide

This guide will walk you through setting up the LeadFlow application from scratch.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or higher) or **Bun** installed
2. **PostgreSQL** database (local or cloud-hosted)
3. Accounts and API keys for:
   - Clerk (authentication)
   - Apollo.io (lead data)
   - OpenAI (email generation)
   - Resend (email sending)

## Step 1: Get Your API Keys

### Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. From the dashboard, copy:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
4. In Clerk dashboard, configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/onboarding`
   - After sign-up URL: `/onboarding`

### Apollo.io (Lead Data)

1. Go to [apollo.io](https://apollo.io) and sign up
2. Navigate to Settings > API
3. Generate an API key
4. Copy the API key (keep it secure!)

**Note**: Apollo API has rate limits and paid tiers. Check their pricing for your usage needs.

### OpenAI (Email Generation)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (it starts with `sk-`)

**Note**: OpenAI charges per token. Monitor your usage in the dashboard.

### Resend (Email Sending)

1. Go to [resend.com](https://resend.com) and sign up
2. From the dashboard, copy your API key
3. Add and verify your sending domain:
   - Go to Domains section
   - Add your domain
   - Add the provided DNS records to your domain
   - Wait for verification (usually a few minutes)
4. For testing, you can use the default `onboarding@resend.dev` email

## Step 2: Set Up Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE leadflow;
```

3. Your connection string will be:

```
postgresql://localhost:5432/leadflow
```

### Option B: Neon (Recommended for Production)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (it includes username, password, host, and database name)

### Option C: Other Cloud Providers

- **Supabase**: Create a project and get the connection string
- **Railway**: Deploy PostgreSQL and copy the connection string
- **Render**: Create a PostgreSQL instance

## Step 3: Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your actual values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/database

# Apollo API
APOLLO_API_KEY=your_apollo_api_key_here

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=hello@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Install Dependencies

Using Bun (faster):

```bash
bun install
```

Or using npm:

```bash
npm install
```

## Step 5: Set Up Database Schema

Generate the migration files:

```bash
bun run db:generate
```

Run the migrations:

```bash
bun run db:migrate
```

This will create all necessary tables in your database:

- users
- leads
- email_campaigns
- emails
- automation_rules
- email_events

## Step 6: Start Development Server

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: First Time Setup

1. Open the app in your browser
2. Click "Get Started" or "Sign Up"
3. Create an account with Clerk
4. Complete the onboarding wizard:
   - Enter business information
   - Select marketing goals
   - Define target audience
   - Set email preferences
   - Configure automation rules
5. You'll be redirected to the dashboard

## Step 8: Testing the Application

### Test Lead Search

1. From the dashboard, enter search criteria:
   - Keywords: "software engineer"
   - Job Titles: "CTO, VP of Engineering"
   - Industries: "Technology"
   - Company Sizes: "51-200"
   - Locations: "United States"

2. Click "Search Leads"
3. View the imported leads in the Leads page

### Test Email Generation

1. Go to Leads page
2. Click on a lead to view their profile
3. Go to "Generate Email" tab
4. Select tone (e.g., Professional)
5. Click "Generate Email"
6. Review the AI-generated email

### Test Email Sending

1. Go to Emails page
2. View pending emails
3. Edit if needed
4. Click "Send Now" to send
5. Monitor the status

**Important**: For testing, send emails only to your own email addresses until you're ready for
production.

## Step 9: Configure Resend Webhook (Optional)

To track email opens and clicks:

1. In your Resend dashboard, go to Webhooks
2. Add a new webhook with URL: `https://yourdomain.com/api/webhooks/resend`
3. Select events to track:
   - email.delivered
   - email.opened
   - email.clicked
   - email.bounced
   - email.complained

**Note**: For local development, use a tool like ngrok to expose your local server.

## Step 10: View Database (Optional)

To view your database in a GUI:

```bash
bun run db:studio
```

This opens Drizzle Studio in your browser where you can view and edit data.

## Common Issues and Solutions

### Database Connection Fails

- Verify your DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure database exists
- Check network connectivity (for cloud databases)

### Clerk Authentication Not Working

- Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- Check that URLs are configured correctly in Clerk dashboard
- Clear browser cache and cookies

### Apollo API Errors

- Verify your API key is valid
- Check if you've exceeded rate limits
- Ensure you have an active Apollo subscription

### Emails Not Sending

- Verify Resend API key
- Check if FROM email domain is verified
- Review Resend dashboard for error logs
- Ensure email content doesn't violate policies

### OpenAI Errors

- Verify API key is valid
- Check if you have available credits
- Monitor usage in OpenAI dashboard
- Verify API access level (some features require paid tier)

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as .env.local)
5. Deploy

### Database

For production, use a managed database:

- Neon (optimized for Vercel)
- Supabase
- AWS RDS
- Railway

### Environment Variables

Set all environment variables in your deployment platform. Never commit `.env.local` to git.

### Domain Setup

1. Add your custom domain in Vercel
2. Update DNS records
3. Update NEXT_PUBLIC_APP_URL to your domain
4. Update Resend webhook URL to your domain
5. Update Clerk URLs to your domain

## Monitoring

### Track Usage

- **Apollo API**: Check usage in Apollo dashboard
- **OpenAI**: Monitor token usage and costs
- **Resend**: Track email sending volume
- **Database**: Monitor database size and queries

### Application Metrics

- Lead acquisition rate
- Email generation success rate
- Email delivery rate
- Open and click rates
- User engagement

## Security Best Practices

1. Never commit API keys to git
2. Use strong passwords for database
3. Enable 2FA on all service accounts
4. Regularly rotate API keys
5. Monitor for unusual activity
6. Keep dependencies updated
7. Use HTTPS in production
8. Implement rate limiting for API routes

## Support

If you encounter issues:

1. Check this setup guide
2. Review error messages carefully
3. Check service status pages (Clerk, Resend, etc.)
4. Review API documentation
5. Create an issue on GitHub

## Next Steps

After setup:

1. Customize the landing page with your branding
2. Adjust email templates to your style
3. Fine-tune automation rules
4. Set up proper analytics
5. Create email campaigns
6. Train team members on the system

Congratulations! Your LeadFlow application is now set up and ready to use.


<<<<<<< HEAD
=======



>>>>>>> main
