# OrisAI - AI-Powered Lead Generation System

A comprehensive lead generation and email marketing platform that uses Apollo API for lead
discovery, OpenAI for personalized email generation, and features a hybrid automation workflow.

## Features

- **Smart Lead Discovery**: Search and import leads from Apollo API with rich profile data
- **AI Email Generation**: Generate personalized emails using GPT-4 based on lead profiles
- **Hybrid Automation**: Set rules for automatic sending or manual review
- **Lead Management**: View comprehensive lead profiles with employment history, company details,
  and social profiles
- **Email Review System**: Review, edit, and approve emails before sending
- **Campaign Analytics**: Track email performance with open rates, click rates, and engagement
  metrics
- **Secure Authentication**: Clerk authentication with protected routes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**:
  - Apollo API for lead data
  - OpenAI GPT-4 for email generation
  - Resend for email delivery
- **Form Validation**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- API keys for:
  - Clerk
  - Apollo API
  - OpenAI
  - Resend

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd email
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/email_leads

# Apollo API
APOLLO_API_KEY=your_apollo_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_email@domain.com
```

4. Set up the database:

```bash
# Generate migration
bun run db:generate

# Run migration
bun run db:migrate
```

5. Start the development server:

```bash
bun run dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

- `bun run db:generate` - Generate migration files from schema
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema changes directly to database (development)
- `bun run db:studio` - Open Drizzle Studio to view database

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── apollo/          # Apollo API integration
│   │   ├── emails/          # Email generation & sending
│   │   ├── user/            # User management
│   │   └── webhooks/        # Webhook handlers
│   ├── dashboard/           # Dashboard pages
│   │   ├── campaigns/       # Campaign management
│   │   ├── emails/          # Email review
│   │   ├── leads/           # Lead management
│   │   └── settings/        # User settings
│   ├── onboarding/          # Onboarding flow
│   └── sign-in/sign-up/     # Auth pages
├── components/              # React components
│   ├── emails/              # Email-related components
│   ├── leads/               # Lead-related components
│   └── ui/                  # Shadcn UI components
├── db/                      # Database
│   ├── index.ts            # Database connection
│   └── schema.ts           # Drizzle schema
└── lib/                     # Utility libraries
    ├── apollo.ts           # Apollo API client
    ├── openai.ts           # OpenAI client
    ├── resend.ts           # Resend client
    └── utils.ts            # Utility functions
```

## Usage

### 1. Onboarding

After signing up, complete the onboarding process to:

- Provide business information
- Set marketing goals
- Define target audience criteria
- Configure email preferences
- Set up automation rules

### 2. Finding Leads

From the dashboard:

1. Enter search criteria (keywords, job titles, industries, etc.)
2. Click "Search Leads"
3. Leads will be imported from Apollo API and saved to your database

### 3. Generating Emails

For each lead:

1. Navigate to the lead's profile
2. Go to the "Generate Email" tab
3. Select tone and add custom instructions
4. Click "Generate Email"
5. Review the generated email

### 4. Reviewing & Sending

From the Emails page:

1. View all pending emails
2. Edit email content if needed
3. Click "Send Now" to send immediately
4. Or click "Schedule" to schedule for later

### 5. Tracking Performance

From the Campaigns page:

- View email metrics (sent, opened, clicked)
- Track open rates and click rates
- Analyze campaign performance

## Automation

The system supports hybrid automation:

- **Auto-Send**: Emails matching your criteria are sent automatically
- **Manual Review**: Other emails are queued for your review
- **Rules**: Define custom rules in Settings or during onboarding

## API Integrations

### Apollo API

Used for:

- Searching for leads by various criteria
- Enriching lead profiles with detailed information
- Accessing employment history, education, and company data

### OpenAI

Used for:

- Generating personalized email content
- Creating subject lines
- Multiple tone options (professional, casual, friendly, formal)

### Resend

Used for:

- Sending emails
- Tracking delivery, opens, and clicks
- Handling webhooks for engagement events

## Webhooks

### Resend Webhook

Configure your Resend webhook URL to: `https://yourdomain.com/api/webhooks/resend`

The webhook handles:

- Email delivery confirmations
- Open tracking
- Click tracking
- Bounce handling

## Development

### Adding a New Feature

1. Create necessary database tables in `src/db/schema.ts`
2. Generate migration: `bun run db:generate`
3. Run migration: `bun run db:migrate`
4. Create API routes in `src/app/api/`
5. Create UI components in `src/components/`
6. Create pages in `src/app/dashboard/`

### Testing

Before deploying:

1. Test with small batches of leads
2. Verify email generation quality
3. Test automation rules
4. Monitor webhook events

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database

Use a managed PostgreSQL service:

- Neon (recommended for Vercel)
- Supabase
- Railway
- Render

### Environment Variables

Ensure all environment variables are set in your deployment platform.

## Security

- All routes except landing page require authentication
- API keys stored securely in environment variables
- Database queries use parameterized statements (Drizzle ORM)
- CORS and security headers configured

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if database server is running
- Ensure database exists

### API Errors

- Verify all API keys are set correctly
- Check API rate limits
- Review API documentation for changes

### Email Not Sending

- Verify Resend API key
- Check FROM email is verified in Resend
- Review email status in dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions:

- Create an issue on GitHub
- Contact support at support@leadflow.com

## Acknowledgments

- Apollo.io for lead data API
- OpenAI for GPT-4 email generation
- Resend for email delivery
- Clerk for authentication
- Vercel for Next.js framework
