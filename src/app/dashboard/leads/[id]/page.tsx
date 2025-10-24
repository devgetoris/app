import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { LeadEmailGenerator } from "@/components/leads/lead-email-generator";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Get lead
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
  });

  if (!lead) {
    redirect("/dashboard/leads");
  }

  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="outline" size="sm">
            ← Back to Leads
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
              {lead.profilePhoto ? (
                <Image
                  src={lead.profilePhoto}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-semibold">
                  {lead.firstName?.[0]}
                  {lead.lastName?.[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-xl text-muted-foreground mt-1">{lead.title}</p>
              {lead.companyName && (
                <p className="text-lg text-muted-foreground mt-1">
                  {lead.companyName}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <Badge>{lead.status || "new"}</Badge>
                {lead.seniority && (
                  <Badge variant="outline">{lead.seniority}</Badge>
                )}
                {lead.fitScore && (
                  <Badge variant="secondary">Fit Score: {lead.fitScore}</Badge>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {lead.linkedinUrl && (
                  <a
                    href={lead.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                  </a>
                )}
                {lead.twitterUrl && (
                  <a
                    href={lead.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`}>
                    <Button variant="outline" size="sm">
                      Email
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment History</TabsTrigger>
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="email">Generate Email</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.email && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Email:
                  </span>
                  <p className="text-sm">{lead.email}</p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Phone:
                  </span>
                  <p className="text-sm">{lead.phone}</p>
                </div>
              )}
              {lead.companyCity && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Location:
                  </span>
                  <p className="text-sm">
                    {[lead.companyCity, lead.companyState, lead.companyCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{lead.bio}</p>
              </CardContent>
            </Card>
          )}

          {lead.departments && lead.departments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.departments.map((dept, index) => (
                    <Badge key={index} variant="outline">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Employment History Tab */}
        <TabsContent value="employment" className="space-y-4">
          {lead.employmentHistory && lead.employmentHistory.length > 0 ? (
            lead.employmentHistory.map((job, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>
                    {job.company}
                    {job.current && " • Current"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {job.startDate} - {job.endDate || "Present"}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No employment history available
              </CardContent>
            </Card>
          )}

          {lead.education && lead.education.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-8 mb-4">Education</h3>
              {lead.education.map((edu, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{edu.school}</CardTitle>
                    {edu.degree && (
                      <CardDescription>
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {edu.startDate && (
                      <p className="text-sm text-muted-foreground">
                        {edu.startDate} - {edu.endDate || "Present"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Company Details Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.companyName && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Name:
                  </span>
                  <p className="text-sm">{lead.companyName}</p>
                </div>
              )}
              {lead.companyIndustry && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Industry:
                  </span>
                  <p className="text-sm">{lead.companyIndustry}</p>
                </div>
              )}
              {lead.companySize && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Size:
                  </span>
                  <p className="text-sm">{lead.companySize} employees</p>
                </div>
              )}
              {lead.companyRevenue && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Revenue:
                  </span>
                  <p className="text-sm">{lead.companyRevenue}</p>
                </div>
              )}
              {lead.companyLocation && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Location:
                  </span>
                  <p className="text-sm">{lead.companyLocation}</p>
                </div>
              )}
              {lead.companyDomain && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Website:
                  </span>
                  <a
                    href={`https://${lead.companyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {lead.companyDomain}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.companyTechnologies && lead.companyTechnologies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.companyTechnologies.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Email Generation Tab */}
        <TabsContent value="email">
          <LeadEmailGenerator leadId={lead.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
