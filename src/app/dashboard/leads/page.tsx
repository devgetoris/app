import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, leads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { LeadsManagement } from "@/components/leads/leads-management";

export default async function LeadsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    redirect("/sign-in");
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

      {/* Leads Management */}
      <LeadsManagement leads={allLeads} />
    </div>
  );
}
