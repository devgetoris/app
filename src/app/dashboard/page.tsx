"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Predefined options for multi-select
const JOB_TITLES = [
  "CEO",
  "CTO",
  "COO",
  "CFO",
  "VP of Engineering",
  "VP of Sales",
  "VP of Marketing",
  "Engineering Manager",
  "Product Manager",
  "Sales Manager",
  "Director of Engineering",
  "Director of Sales",
  "Director of Marketing",
  "Head of Product",
  "Head of Engineering",
  "Head of Sales",
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Developer",
  "Marketing Manager",
  "Sales Representative",
  "Account Executive",
].map(title => ({ label: title, value: title }));

const INDUSTRIES = [
  "Computer Software",
  "Information Technology",
  "Internet",
  "Financial Services",
  "Banking",
  "Insurance",
  "E-commerce",
  "Retail",
  "Consumer Goods",
  "Healthcare",
  "Biotechnology",
  "Pharmaceuticals",
  "Education",
  "EdTech",
  "Online Learning",
  "Marketing",
  "Advertising",
  "Public Relations",
  "Real Estate",
  "Construction",
  "Architecture",
  "Manufacturing",
  "Logistics",
  "Supply Chain",
  "Media",
  "Entertainment",
  "Gaming",
  "Telecommunications",
  "Cloud Computing",
  "Cybersecurity",
].map(industry => ({ label: industry, value: industry }));

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
].map(size => ({ label: `${size} employees`, value: size }));

const LOCATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Australia",
  "New Zealand",
  "Singapore",
  "Hong Kong",
  "India",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Argentina",
  "San Francisco",
  "New York",
  "Los Angeles",
  "Boston",
  "Seattle",
  "London",
  "Berlin",
  "Amsterdam",
  "Paris",
  "Toronto",
].map(location => ({ label: location, value: location }));

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<any>(null);

  const clearAllFilters = () => {
    setKeywords("");
    setSelectedJobTitles([]);
    setSelectedIndustries([]);
    setSelectedCompanySizes([]);
    setSelectedLocations([]);
    toast.success("All filters cleared");
  };

  const handleSearch = async () => {
    // Validate that at least one search criterion is provided
    const hasAnyCriteria =
      keywords.trim() ||
      selectedJobTitles.length > 0 ||
      selectedIndustries.length > 0 ||
      selectedCompanySizes.length > 0 ||
      selectedLocations.length > 0;

    if (!hasAnyCriteria) {
      toast.error("Please select at least one search criterion");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending search request:", {
        keywords,
        jobTitles: selectedJobTitles,
        industries: selectedIndustries,
        companySizes: selectedCompanySizes,
        locations: selectedLocations,
      });

      const response = await fetch("/api/apollo/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          jobTitles: selectedJobTitles,
          industries: selectedIndustries,
          companySizes: selectedCompanySizes,
          locations: selectedLocations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search leads");
      }

      const data = await response.json();

      if (data.leads.length === 0) {
        toast.warning(
          "No leads found. Try using fewer filters or different criteria.",
          {
            duration: 5000,
          }
        );
      } else {
        toast.success(`Found ${data.leads.length} leads!`);
        // Navigate to leads page
        router.push("/dashboard/leads");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to search leads. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setAiLoading(true);
      console.log("🤖 Parsing AI query:", aiQuery);

      const response = await fetch("/api/apollo/parse-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse query");
      }

      const data = await response.json();
      console.log("✅ Parsed query result:", data);

      setParsedQuery(data.parsed);
      toast.success("Query parsed successfully! Review and click 'Search' to find leads.");
    } catch (error) {
      console.error("AI parse error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse query with AI. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchWithParsedQuery = async () => {
    if (!parsedQuery) {
      toast.error("Please parse a query first");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/apollo/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: parsedQuery.keywords,
          jobTitles: parsedQuery.jobTitles,
          industries: parsedQuery.industries,
          companySizes: parsedQuery.companySizes,
          locations: parsedQuery.locations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search leads");
      }

      const data = await response.json();

      if (data.leads.length === 0) {
        toast.warning("No leads found. Try refining your search query.", {
          duration: 5000,
        });
      } else {
        toast.success(`Found ${data.leads.length} leads!`);
        router.push("/dashboard/leads");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setAiLoading(true);
      console.log("🤖 Parsing AI query:", aiQuery);

      const response = await fetch("/api/apollo/parse-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse query");
      }

      const data = await response.json();
      console.log("✅ Parsed query result:", data);

      setParsedQuery(data.parsed);
      toast.success("Query parsed successfully! Review and click 'Search' to find leads.");
    } catch (error) {
      console.error("AI parse error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse query with AI. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchWithParsedQuery = async () => {
    if (!parsedQuery) {
      toast.error("Please parse a query first");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/apollo/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: parsedQuery.keywords,
          jobTitles: parsedQuery.jobTitles,
          industries: parsedQuery.industries,
          companySizes: parsedQuery.companySizes,
          locations: parsedQuery.locations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search leads");
      }

      const data = await response.json();

      if (data.leads.length === 0) {
        toast.warning("No leads found. Try refining your search query.", {
          duration: 5000,
        });
      } else {
        toast.success(`Found ${data.leads.length} leads!`);
        router.push("/dashboard/leads");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search leads. Please try again.");
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
          Welcome back! Start by searching for leads or manage your existing
          campaigns.
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Find New Leads</CardTitle>
              <CardDescription>
                Use AI to parse natural language or traditional filters to search for leads.
              </CardDescription>
            </div>
            {selectedJobTitles.length +
              selectedIndustries.length +
              selectedCompanySizes.length +
              selectedLocations.length +
              (keywords ? 1 : 0) >
              0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedJobTitles.length +
                  selectedIndustries.length +
                  selectedCompanySizes.length +
                  selectedLocations.length +
                  (keywords ? 1 : 0)}{" "}
                active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ai">🤖 AI Search</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* AI Search Tab */}
            <TabsContent value="ai" className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 <strong>AI-Powered Search:</strong> Simply describe who you're looking for in natural language. 
                  Examples: "VP in SF", "CTOs in AI startups", "Product managers in NY tech companies"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-query">What leads are you looking for?</Label>
                <Input
                  id="ai-query"
                  placeholder="e.g., VP in SF, CTOs in AI startups, Product managers in NY"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !aiLoading) {
                      handleAiSearch();
                    }
                  }}
                  disabled={aiLoading}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Press Enter or click "Parse Query" to let AI understand your search
                </p>
              </div>

              {/* Parsed Query Preview */}
              {parsedQuery && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                    ✅ Parsed Search Parameters:
                  </p>
                  <div className="space-y-2 text-sm">
                    {parsedQuery.keywords && (
                      <div>
                        <span className="font-medium">Keywords:</span> {parsedQuery.keywords}
                      </div>
                    )}
                    {parsedQuery.jobTitles.length > 0 && (
                      <div>
                        <span className="font-medium">Job Titles:</span> {parsedQuery.jobTitles.join(", ")}
                      </div>
                    )}
                    {parsedQuery.industries.length > 0 && (
                      <div>
                        <span className="font-medium">Industries:</span> {parsedQuery.industries.join(", ")}
                      </div>
                    )}
                    {parsedQuery.companySizes.length > 0 && (
                      <div>
                        <span className="font-medium">Company Sizes:</span> {parsedQuery.companySizes.join(", ")}
                      </div>
                    )}
                    {parsedQuery.locations.length > 0 && (
                      <div>
                        <span className="font-medium">Locations:</span> {parsedQuery.locations.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={handleAiSearch}
                  disabled={aiLoading || !aiQuery.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {aiLoading ? "Parsing..." : "Parse Query"}
                </Button>
                {parsedQuery && (
                  <Button
                    onClick={handleSearchWithParsedQuery}
                    disabled={loading}
                    size="lg"
                    className="flex-1"
                    variant="default"
                  >
                    {loading ? "Searching..." : "Search Leads"}
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Advanced Search Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">💡 Search Tips:</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Use <strong>"Select All"</strong> or click multiple items at once for faster selection</li>
                  <li>• Start with just a <strong>Location</strong> or <strong>Job Title</strong> for broader results</li>
                  <li>• Combining multiple filters narrows your search significantly</li>
                  <li>• Click the X on badges to remove individual selections</li>
                </ul>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., AI, machine learning, cloud computing"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Search for specific keywords in profiles and companies
                </p>
              </div>

              {/* Job Titles */}
              <div className="space-y-3">
                <Label>Job Titles</Label>
                <MultiSelect
                  options={JOB_TITLES}
                  onValueChange={setSelectedJobTitles}
                  defaultValue={selectedJobTitles}
                  placeholder="Select job titles"
                  variant="secondary"
                  maxCount={3}
                />
              </div>

              {/* Industries */}
              <div className="space-y-3">
                <Label>Industries</Label>
                <MultiSelect
                  options={INDUSTRIES}
                  onValueChange={setSelectedIndustries}
                  defaultValue={selectedIndustries}
                  placeholder="Select industries"
                  variant="secondary"
                  maxCount={3}
                />
              </div>

              {/* Company Sizes */}
              <div className="space-y-3">
                <Label>Company Sizes</Label>
                <MultiSelect
                  options={COMPANY_SIZES}
                  onValueChange={setSelectedCompanySizes}
                  defaultValue={selectedCompanySizes}
                  placeholder="Select company sizes"
                  variant="secondary"
                  maxCount={3}
                />
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <Label>Locations</Label>
                <MultiSelect
                  options={LOCATIONS}
                  onValueChange={setSelectedLocations}
                  defaultValue={selectedLocations}
                  placeholder="Select locations"
                  variant="secondary"
                  maxCount={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading} 
                  size="lg" 
                  className="flex-1"
                >
                  {loading ? "Searching..." : "Search Leads"}
                </Button>
                <Button 
                  onClick={clearAllFilters} 
                  disabled={loading} 
                  variant="outline" 
                  size="lg"
                >
                  Clear All
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity yet. Start by searching for leads!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
