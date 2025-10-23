"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { InlineSearchResults } from "./inline-search-results";

export function LeadsSearchInterface() {
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"people" | "organizations">("people");
  const [aiQuery, setAiQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
      console.log("🤖 AI Search - Direct search:", aiQuery);

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
      const endpoint = searchType === "people" 
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
      console.log("🔍 Search results received in leads interface:", searchData);
      if (searchData.leads && searchData.leads.length > 0) {
        console.log("📋 Sample lead from search results:", JSON.stringify(searchData.leads[0], null, 2));
      }
      
      if (searchType === "people") {
        if (searchData.leads.length === 0) {
          toast.warning("No people found. Try these tips: Use broader terms (e.g., 'Engineer' instead of 'Senior Software Engineer'), add location keywords, or try different job titles.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${searchData.leads.length} people!`);
          setSearchResults(searchData.leads);
        }
      } else {
        if (searchData.organizations.length === 0) {
          toast.warning("No organizations found. Try these tips: Use broader industry terms, add location keywords, or search for specific company types.", {
            duration: 8000,
          });
        } else {
          toast.success(`Found ${searchData.organizations.length} organizations!`);
          setSearchResults(searchData.organizations);
        }
      }
    } catch (error) {
      console.error("AI search error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to search with AI. Please try again."
      );
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
      
      // Clear search results after successful import
      setSearchResults([]);
      setAiQuery("");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import selected results");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Find New {searchType === "people" ? "People" : "Organizations"}</CardTitle>
              <CardDescription>
                Use AI to search for {searchType === "people" ? "people" : "organizations"} in natural language.
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
                    setSearchResults([]); // Clear results when switching types
                  }}
                />
                <Label htmlFor="search-type" className="text-sm font-medium">
                  People
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
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
                if (e.key === "Enter" && !loading) {
                  handleAiSearch();
                }
              }}
              disabled={loading}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or click "Search" to find leads instantly
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              onClick={handleAiSearch}
              disabled={loading || !aiQuery.trim()}
              size="lg"
              className="flex-1"
            >
              {loading ? "Searching..." : `Search ${searchType === "people" ? "People" : "Organizations"}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <InlineSearchResults
        results={searchResults}
        searchType={searchType}
        onImportSelected={handleImportSelected}
        loading={loading}
      />
    </div>
  );
}
