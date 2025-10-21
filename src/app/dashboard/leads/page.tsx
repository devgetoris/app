import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, leads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { LeadCard } from "@/components/leads/lead-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LeadsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    redirect("/onboarding");
  }

  // Get all leads for this user
  const allLeads = await db.query.leads.findMany({
    where: eq(leads.userId, user.id),
    orderBy: [desc(leads.createdAt)],
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage and engage with your leads
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {allLeads.length} {allLeads.length === 1 ? "lead" : "leads"}
        </div>
      </div>

      {/* Leads Grid */}
      {allLeads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No leads yet</CardTitle>
            <CardDescription>
              Search for leads from the dashboard to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the search feature on the dashboard to find and import leads from Apollo API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}


