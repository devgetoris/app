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
import { InlineSearchResults } from "@/components/leads/inline-search-results";

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
  const [searchType, setSearchType] = useState<"people" | "organizations">(
    "people"
  );
  const [keywords, setKeywords] = useState("");
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
      const endpoint =
        searchType === "people"
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
            keywords: keywords
              ? `${keywords} ${selectedIndustries.join(" ")}`
              : selectedIndustries.join(" "),
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
          toast.warning(
            "No people found. Try these tips: Use broader job titles (e.g., 'Manager' instead of 'Product Manager'), add keywords, or remove location filters.",
            {
              duration: 8000,
            }
          );
        } else {
          toast.success(`Found ${data.leads.length} people!`);
          setSearchResults(data.leads);
        }
      } else {
        if (data.organizations.length === 0) {
          toast.warning(
            "No organizations found. Try these tips: Use broader keywords, remove location filters, or search for specific industries.",
            {
              duration: 8000,
            }
          );
        } else {
          toast.success(`Found ${data.organizations.length} organizations!`);
          setSearchResults(data.organizations);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to search. Please try again."
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
      console.log("AI Search - Direct search:", aiQuery);

      // First parse the query
      const parseResponse = await fetch("/api/apollo/parse-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
        }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || "Failed to parse query");
      }

      const parseData = await parseResponse.json();
      console.log("✅ Parsed query result:", parseData);

      // Then immediately search with the parsed query
      const endpoint =
        searchType === "people"
          ? "/api/apollo/search"
          : "/api/apollo/search-organizations";

      const searchResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parseData.parsed),
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const searchData = await searchResponse.json();

      // Debug: Log the search results data
      console.log("🔍 Search results received:", searchData);
      if (searchData.leads && searchData.leads.length > 0) {
        console.log(
          "📋 Sample lead from search results:",
          JSON.stringify(searchData.leads[0], null, 2)
        );
      }

      if (searchType === "people") {
        if (searchData.leads.length === 0) {
          toast.warning(
            "No people found. Try these tips: Use broader terms (e.g., 'Engineer' instead of 'Senior Software Engineer'), add location keywords, or try different job titles.",
            {
              duration: 8000,
            }
          );
        } else {
          toast.success(`Found ${searchData.leads.length} people!`);
          setSearchResults(searchData.leads);
        }
      } else {
        if (searchData.organizations.length === 0) {
          toast.warning(
            "No organizations found. Try these tips: Use broader industry terms, add location keywords, or search for specific company types.",
            {
              duration: 8000,
            }
          );
        } else {
          toast.success(
            `Found ${searchData.organizations.length} organizations!`
          );
          setSearchResults(searchData.organizations);
        }
      }
    } catch (error) {
      console.error("AI search error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to search with AI. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportSelected = async (selectedIds: string[]) => {
    try {
      const selectedResults = searchResults.filter(result =>
        selectedIds.includes(result.id)
      );

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
      toast.success(
        `Successfully imported ${data.imported} ${
          searchType === "people" ? "people" : "organizations"
        } to your leads!`
      );
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import selected results"
      );
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
              <CardTitle>
                Find New {searchType === "people" ? "People" : "Organizations"}
              </CardTitle>
              <CardDescription>
                Use AI to parse natural language or traditional filters to
                search for{" "}
                {searchType === "people" ? "people" : "organizations"}.
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
                  onCheckedChange={checked => {
                    setSearchType(checked ? "people" : "organizations");
                  }}
                />
                <Label htmlFor="search-type" className="text-sm font-medium">
                  People
                </Label>
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ai">AI Search</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* AI Search Tab */}
            <TabsContent value="ai" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-query">
                  What {searchType === "people" ? "people" : "organizations"}{" "}
                  are you looking for?
                </Label>
                <Input
                  id="ai-query"
                  placeholder={
                    searchType === "people"
                      ? "e.g., VP in SF, CTOs in AI startups, Product managers in NY"
                      : "e.g., Tech companies in SF, AI startups with 50+ employees, Companies using React"
                  }
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !aiLoading) {
                      handleAiSearch();
                    }
                  }}
                  disabled={aiLoading}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground"></p>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={handleAiSearch}
                  disabled={aiLoading || !aiQuery.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {aiLoading
                    ? "Searching..."
                    : `Search ${
                        searchType === "people" ? "People" : "Organizations"
                      }`}
                </Button>
              </div>
            </TabsContent>

            {/* Advanced Search Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Search Tips:</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>
                    • Use <strong>"Select All"</strong> or click multiple items
                    at once for faster selection
                  </li>
                  <li>
                    • Start with just a <strong>Location</strong> or{" "}
                    <strong>Job Title</strong> for broader results
                  </li>
                  <li>
                    • Combining multiple filters narrows your search
                    significantly
                  </li>
                  <li>
                    • Click the X on badges to remove individual selections
                  </li>
                </ul>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., AI, machine learning, cloud computing"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
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
                  {loading
                    ? "Searching..."
                    : `Search ${
                        searchType === "people" ? "People" : "Organizations"
                      }`}
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

      {/* Recent Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Search Results</CardTitle>
            <CardDescription>
              Your latest search results - select and import to add to your
              leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InlineSearchResults
              results={searchResults}
              onImportSelected={handleImportSelected}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

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
