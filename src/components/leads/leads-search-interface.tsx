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
import { toast } from "sonner";
import { InlineSearchResults } from "./inline-search-results";

export function LeadsSearchInterface() {
  const [loading, setLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
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

      // Then immediately search with the parsed query - try people first, then organizations if no results
      let searchResponse = await fetch("/api/apollo/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parseData.parsed),
      });

      let searchData = await searchResponse.json();

      // If no people found, try organizations
      if (!searchData.leads || searchData.leads.length === 0) {
        console.log("🔍 No people found, trying organizations...");
        searchResponse = await fetch("/api/apollo/search-organizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parseData.parsed),
        });
        searchData = await searchResponse.json();
      }

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || "Failed to search");
      }

      // Debug: Log the search results data
      console.log("🔍 Search results received in leads interface:", searchData);

      // Handle results - check if we have people or organizations
      const hasPeople = searchData.leads && searchData.leads.length > 0;
      const hasOrganizations =
        searchData.organizations && searchData.organizations.length > 0;

      if (hasPeople) {
        console.log(
          "📋 Sample person from search results:",
          JSON.stringify(searchData.leads[0], null, 2)
        );
        toast.success(`Found ${searchData.leads.length} people!`);
        setSearchResults(searchData.leads);
      } else if (hasOrganizations) {
        console.log(
          "📋 Sample organization from search results:",
          JSON.stringify(searchData.organizations[0], null, 2)
        );
        toast.success(
          `Found ${searchData.organizations.length} organizations!`
        );
        setSearchResults(searchData.organizations);
      } else {
        toast.warning(
          "No results found. Try these tips: Use broader terms, add location keywords, or try different search terms.",
          {
            duration: 8000,
          }
        );
      }
    } catch (error) {
      console.error("AI search error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to search with AI. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportSelected = async (selectedIds: string[]) => {
    try {
      const selectedResults = searchResults.filter(result =>
        selectedIds.includes(result.id)
      );

      // Determine search type based on the results
      const searchType =
        selectedResults.length > 0 &&
        selectedResults[0].recordType === "organization"
          ? "organizations"
          : "people";

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
      const resultType = searchType === "people" ? "people" : "organizations";
      toast.success(
        `Successfully imported ${data.imported} ${resultType} to your leads!`
      );

      // Clear search results after successful import
      setSearchResults([]);
      setAiQuery("");
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
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Find New Leads</CardTitle>
              <CardDescription>
                Use AI to search for people and organizations in natural
                language.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>AI-Powered Search:</strong> Simply describe what you're
              looking for in natural language. Examples: "VP in SF", "CTOs in AI
              startups", "Product managers in NY tech companies", "Tech
              companies in SF", "AI startups with 50+ employees", "Companies
              using React"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-query">What are you looking for?</Label>
            <Input
              id="ai-query"
              placeholder="e.g., VP in SF, CTOs in AI startups, Product managers in NY, Tech companies in SF, AI startups with 50+ employees"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => {
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
              {loading ? "Searching..." : "Search Leads"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <InlineSearchResults
        results={searchResults}
        onImportSelected={handleImportSelected}
        loading={loading}
      />
    </div>
  );
}
