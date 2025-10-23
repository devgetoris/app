import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, emailCampaigns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CampaignsPage() {
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

  // Get all campaigns for this user
  const campaigns = await db.query.emailCampaigns.findMany({
    where: eq(emailCampaigns.userId, user.id),
    orderBy: [desc(emailCampaigns.createdAt)],
  });

  const calculateOpenRate = (campaign: (typeof campaigns)[0]) => {
    if (!campaign.emailsSent || campaign.emailsSent === 0) return 0;
    if (!campaign.emailsOpened) return 0;
    return Math.round((campaign.emailsOpened / campaign.emailsSent) * 100);
  };

  const calculateClickRate = (campaign: (typeof campaigns)[0]) => {
    if (!campaign.emailsSent || campaign.emailsSent === 0) return 0;
    if (!campaign.emailsClicked) return 0;
    return Math.round((campaign.emailsClicked / campaign.emailsSent) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your email campaigns
          </p>
        </div>
        <Button>Create Campaign</Button>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No campaigns yet</CardTitle>
            <CardDescription>
              Create your first campaign to start organizing your outreach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Create Campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    {campaign.description && (
                      <CardDescription className="mt-2">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={campaign.isActive ? "default" : "secondary"}>
                    {campaign.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-6 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.totalLeads}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Leads
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.emailsSent}
                    </div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.emailsOpened}
                    </div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {calculateOpenRate(campaign)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Open Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.emailsClicked}
                    </div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {calculateClickRate(campaign)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click Rate
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    {campaign.isActive ? "Pause" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
<<<<<<< HEAD
=======




>>>>>>> 262fcb9 (somewhat working)
