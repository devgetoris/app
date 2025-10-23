import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, emails, leads } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { EmailReviewCard } from "@/components/emails/email-review-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EmailsPage() {
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

  // Get emails with their associated leads
  const allEmails = await db
    .select({
      email: emails,
      lead: leads,
    })
    .from(emails)
    .leftJoin(leads, eq(emails.leadId, leads.id))
    .where(eq(emails.userId, user.id))
    .orderBy(desc(emails.createdAt));

  // Filter emails by status
  const pendingEmails = allEmails.filter(
    (e) => e.email.status === "draft" || e.email.status === "pending_review"
  );
  const scheduledEmails = allEmails.filter((e) => e.email.status === "scheduled");
  const sentEmails = allEmails.filter((e) => e.email.status === "sent");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <p className="text-muted-foreground mt-2">
          Review, edit, and manage your email campaigns
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEmails.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledEmails.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentEmails.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEmails.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingEmails.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledEmails.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentEmails.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Emails */}
        <TabsContent value="pending" className="space-y-4">
          {pendingEmails.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending emails. Generate emails from the leads page.
              </CardContent>
            </Card>
          ) : (
            pendingEmails.map(({ email, lead }) => (
              <EmailReviewCard key={email.id} email={email} lead={lead} />
            ))
          )}
        </TabsContent>

        {/* Scheduled Emails */}
        <TabsContent value="scheduled" className="space-y-4">
          {scheduledEmails.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No scheduled emails
              </CardContent>
            </Card>
          ) : (
            scheduledEmails.map(({ email, lead }) => (
              <EmailReviewCard key={email.id} email={email} lead={lead} />
            ))
          )}
        </TabsContent>

        {/* Sent Emails */}
        <TabsContent value="sent" className="space-y-4">
          {sentEmails.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No sent emails yet
              </CardContent>
            </Card>
          ) : (
            sentEmails.map(({ email, lead }) => (
              <EmailReviewCard key={email.id} email={email} lead={lead} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}




