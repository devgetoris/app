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
import { Switch } from "@/components/ui/switch";
import { SearchResultsModal } from "@/components/leads/search-results-modal";

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
  const [searchType, setSearchType] = useState<"people" | "organizations">("people");
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

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

      // Choose the appropriate endpoint based on search type
      const endpoint = searchType === "people" 
        ? "/api/apollo/search-people" 
        : "/api/apollo/search-organizations";

      console.log("Sending search request:", {
        searchType,
        keywords,
        jobTitles: selectedJobTitles,
        industries: selectedIndustries,
        companySizes: selectedCompanySizes,
        locations: selectedLocations,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          person_titles: selectedJobTitles,
          person_locations: selectedLocations,
          organization_locations: selectedLocations,
          organization_num_employees_ranges: selectedCompanySizes,
          // Map industries to keywords for broader search
          ...(selectedIndustries.length > 0 && { 
            keywords: keywords ? `${keywords} ${selectedIndustries.join(" ")}` : selectedIndustries.join(" ")
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const data = await response.json();
      
      if (searchType === "people") {
        if (data.leads.length === 0) {
          toast.warning("No people found. Try these tips: Use broader job titles (e.g., 'Manager' instead of 'Product Manager'), add keywords, or remove location filters.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${data.leads.length} people!`);
          setSearchResults(data.leads);
          setShowResultsModal(true);
        }
      } else {
        if (data.organizations.length === 0) {
          toast.warning("No organizations found. Try these tips: Use broader keywords, remove location filters, or search for specific industries.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${data.organizations.length} organizations!`);
          setSearchResults(data.organizations);
          setShowResultsModal(true);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search. Please try again.");
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

      // Choose the appropriate endpoint based on search type
      const endpoint = searchType === "people" 
        ? "/api/apollo/search-people" 
        : "/api/apollo/search-organizations";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedQuery),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const data = await response.json();

      if (searchType === "people") {
        if (data.leads.length === 0) {
          toast.warning("No people found. Try these tips: Use broader terms (e.g., 'Engineer' instead of 'Senior Software Engineer'), add location keywords, or try different job titles.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${data.leads.length} people!`);
          setSearchResults(data.leads);
          setShowResultsModal(true);
        }
      } else {
        if (data.organizations.length === 0) {
          toast.warning("No organizations found. Try these tips: Use broader industry terms, add location keywords, or search for specific company types.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${data.organizations.length} organizations!`);
          setSearchResults(data.organizations);
          setShowResultsModal(true);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportSelected = async (selectedIds: string[]) => {
    try {
      const selectedResults = searchResults.filter(result => selectedIds.includes(result.id));
      
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedResults,
          searchType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import leads");
      }

      const data = await response.json();
      toast.success(`Successfully imported ${data.imported} ${searchType === "people" ? "people" : "organizations"} to your leads!`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import selected results");
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
              <CardTitle>Find New {searchType === "people" ? "People" : "Organizations"}</CardTitle>
              <CardDescription>
                Use AI to parse natural language or traditional filters to search for {searchType === "people" ? "people" : "organizations"}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Type Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="search-type" className="text-sm font-medium">
                  Organizations
                </Label>
                <Switch
                  id="search-type"
                  checked={searchType === "people"}
                  onCheckedChange={(checked) => {
                    setSearchType(checked ? "people" : "organizations");
                    setParsedQuery(null); // Clear parsed query when switching types
                  }}
                />
                <Label htmlFor="search-type" className="text-sm font-medium">
                  People
                </Label>
              </div>
              {(selectedJobTitles.length + selectedIndustries.length + selectedCompanySizes.length + selectedLocations.length + (keywords ? 1 : 0)) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedJobTitles.length + selectedIndustries.length + selectedCompanySizes.length + selectedLocations.length + (keywords ? 1 : 0)} active
                </Badge>
              )}
            </div>
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
                  💡 <strong>AI-Powered Search:</strong> Simply describe what you're looking for in natural language. 
                  {searchType === "people" ? (
                    <>Examples: "VP in SF", "CTOs in AI startups", "Product managers in NY tech companies"</>
                  ) : (
                    <>Examples: "Tech companies in SF", "AI startups with 50+ employees", "Companies using React"</>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-query">
                  What {searchType === "people" ? "people" : "organizations"} are you looking for?
                </Label>
                <Input
                  id="ai-query"
                  placeholder={
                    searchType === "people" 
                      ? "e.g., VP in SF, CTOs in AI startups, Product managers in NY"
                      : "e.g., Tech companies in SF, AI startups with 50+ employees, Companies using React"
                  }
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
                    {parsedQuery.person_titles?.length > 0 && (
                      <div>
                        <span className="font-medium">Job Titles:</span> {parsedQuery.person_titles.join(", ")}
                      </div>
                    )}
                    {parsedQuery.person_seniorities?.length > 0 && (
                      <div>
                        <span className="font-medium">Seniority:</span> {parsedQuery.person_seniorities.join(", ")}
                      </div>
                    )}
                    {parsedQuery.person_locations?.length > 0 && (
                      <div>
                        <span className="font-medium">Person Locations:</span> {parsedQuery.person_locations.join(", ")}
                      </div>
                    )}
                    {parsedQuery.organization_locations?.length > 0 && (
                      <div>
                        <span className="font-medium">Company Locations:</span> {parsedQuery.organization_locations.join(", ")}
                      </div>
                    )}
                    {parsedQuery.organization_num_employees_ranges?.length > 0 && (
                      <div>
                        <span className="font-medium">Company Sizes:</span> {parsedQuery.organization_num_employees_ranges.join(", ")}
                      </div>
                    )}
                    {parsedQuery.q_organization_domains_list?.length > 0 && (
                      <div>
                        <span className="font-medium">Company Domains:</span> {parsedQuery.q_organization_domains_list.join(", ")}
                      </div>
                    )}
                    {parsedQuery.currently_using_any_of_technology_uids?.length > 0 && (
                      <div>
                        <span className="font-medium">Technologies:</span> {parsedQuery.currently_using_any_of_technology_uids.join(", ")}
                      </div>
                    )}
                    {parsedQuery.revenue_range && (
                      <div>
                        <span className="font-medium">Revenue Range:</span> {
                          parsedQuery.revenue_range.min && parsedQuery.revenue_range.max 
                            ? `$${parsedQuery.revenue_range.min.toLocaleString()} - $${parsedQuery.revenue_range.max.toLocaleString()}`
                            : parsedQuery.revenue_range.min 
                              ? `$${parsedQuery.revenue_range.min.toLocaleString()}+`
                              : `Up to $${parsedQuery.revenue_range.max.toLocaleString()}`
                        }
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
                    {loading ? "Searching..." : `Search ${searchType === "people" ? "People" : "Organizations"}`}
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
                  {loading ? "Searching..." : `Search ${searchType === "people" ? "People" : "Organizations"}`}
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

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={searchResults}
        searchType={searchType}
        onImportSelected={handleImportSelected}
        loading={loading}
      />
    </div>
  );
}
