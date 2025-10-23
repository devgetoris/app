# Clerk Authentication Configuration

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Clerk Routes Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database
DATABASE_URL=your_database_url_here

# Apollo API
APOLLO_API_KEY=your_apollo_api_key_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Resend API
RESEND_API_KEY=your_resend_api_key_here
```

## Get Your Clerk Keys

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application (or create a new one)
3. Navigate to **API Keys** in the sidebar
4. Copy your **Publishable Key** and **Secret Key**

## Enable Email Code Authentication

1. In your Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Make sure **Email address** is enabled
3. Go to **User & Authentication** → **Email & SMS**
4. Under **Email verification**, enable **Email verification code**

## Enable Google OAuth (Optional)

1. In your Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Enable **Google**
3. Follow the instructions to set up Google OAuth credentials

## What's Fixed

The authentication system now:

✅ Uses custom UI with your beautiful design (video background, testimonial, etc.) ✅ Properly
implements Clerk's `useSignIn` and `useSignUp` hooks with `setActive` ✅ Handles email code
verification flow correctly ✅ Supports Google OAuth with proper redirect URLs ✅ Routes are
properly configured:

- `/sign-in` and `/sign-up` redirect to `/auth/sign-in` and `/auth/sign-up`
- `/auth/sign-in` and `/auth/sign-up` show your custom UI
- All routes are public in middleware
- SSO callback page handles OAuth redirects ✅ After sign-in: redirects to `/dashboard` ✅ After
  sign-up: redirects to `/onboarding`

## Testing

1. Make sure your `.env.local` file is configured
2. Run `bun dev` or `npm run dev`
3. Visit `http://localhost:3000`
4. Try signing up with email - you should receive a verification code
5. Try signing in with Google OAuth
6. Check that redirects work correctly after authentication
