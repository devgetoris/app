"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keywords: "",
    jobTitles: "",
    industries: "",
    companySizes: "",
    locations: "",
  });

  const handleSearch = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/apollo/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: searchParams.keywords,
          jobTitles: searchParams.jobTitles.split(",").map(t => t.trim()).filter(Boolean),
          industries: searchParams.industries.split(",").map(i => i.trim()).filter(Boolean),
          companySizes: searchParams.companySizes.split(",").map(s => s.trim()).filter(Boolean),
          locations: searchParams.locations.split(",").map(l => l.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search leads");
      }

      const data = await response.json();
      
      toast.success(`Found ${data.leads.length} leads!`);
      
      // Navigate to leads page
      router.push("/dashboard/leads");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Start by searching for leads or manage your existing campaigns.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reply Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find New Leads</CardTitle>
          <CardDescription>
            Search for leads using Apollo API. We&apos;ll find the perfect prospects for your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="e.g., software, marketing, sales"
                value={searchParams.keywords}
                onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitles">Job Titles</Label>
              <Input
                id="jobTitles"
                placeholder="e.g., CEO, VP of Sales, Marketing Director"
                value={searchParams.jobTitles}
                onChange={(e) => setSearchParams({ ...searchParams, jobTitles: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industries">Industries</Label>
              <Input
                id="industries"
                placeholder="e.g., Technology, SaaS, E-commerce"
                value={searchParams.industries}
                onChange={(e) => setSearchParams({ ...searchParams, industries: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySizes">Company Sizes</Label>
              <Input
                id="companySizes"
                placeholder="e.g., 11-50, 51-200"
                value={searchParams.companySizes}
                onChange={(e) => setSearchParams({ ...searchParams, companySizes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locations">Locations</Label>
              <Input
                id="locations"
                placeholder="e.g., United States, Canada, United Kingdom"
                value={searchParams.locations}
                onChange={(e) => setSearchParams({ ...searchParams, locations: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} size="lg">
            {loading ? "Searching..." : "Search Leads"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity yet. Start by searching for leads!</p>
        </CardContent>
      </Card>
    </div>
  );
}


