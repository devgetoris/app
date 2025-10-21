
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has completed onboarding
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user || !user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg" />
                <span className="text-xl font-bold">LeadFlow</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/dashboard/leads">
                  <Button variant="ghost">Leads</Button>
                </Link>
                <Link href="/dashboard/emails">
                  <Button variant="ghost">Emails</Button>
                </Link>
                <Link href="/dashboard/campaigns">
                  <Button variant="ghost">Campaigns</Button>
                </Link>
                <Link href="/dashboard/automation">
                  <Button variant="ghost">Automation</Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost">Settings</Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

