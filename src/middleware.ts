import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Require auth for protected routes
  if (!userId) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow onboarding route for authenticated users
  if (isOnboardingRoute(request)) {
    return NextResponse.next();
  }

  // For dashboard routes, we'll check onboarding completion in the dashboard layout
  // This allows us to access the database to check user status

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


