"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { LeadCard } from "./lead-card";

interface Lead {
  id: string;
  recordType: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  title: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyIndustry: string | null;
  companySize: string | null;
  companyRevenue: string | null;
  companyLocation: string | null;
  companyCity: string | null;
  companyState: string | null;
  companyCountry: string | null;
  companyFunding: string | null;
  companyTechnologies: string[] | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  githubUrl: string | null;
  profilePhoto: string | null;
  bio: string | null;
  keywords: string[] | null;
  status: string | null;
  fitScore: number | null;
  apolloData: any | null;
  createdAt: Date;
}

interface LeadsManagementProps {
  leads: Lead[];
}

export function LeadsManagement({ leads }: LeadsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "company" | "createdAt" | "status"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<
    "all" | "individual" | "organization"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "contacted" | "replied" | "converted" | "unsubscribed"
  >("all");

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        lead.firstName?.toLowerCase().includes(searchLower) ||
        lead.lastName?.toLowerCase().includes(searchLower) ||
        lead.companyName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.title?.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType =
        filterType === "all" ||
        (filterType === "individual" &&
          (lead.recordType === "individual" || lead.recordType === null)) ||
        (filterType === "organization" && lead.recordType === "organization");

      // Status filter
      const matchesStatus =
        filterStatus === "all" || lead.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case "name":
          aValue =
            `${a.firstName || ""} ${a.lastName || ""}`.trim() ||
            a.companyName ||
            "";
          bValue =
            `${b.firstName || ""} ${b.lastName || ""}`.trim() ||
            b.companyName ||
            "";
          break;
        case "company":
          aValue = a.companyName || "";
          bValue = b.companyName || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "createdAt":
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, searchQuery, sortBy, sortOrder, filterType, filterStatus]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    searchQuery || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Leads</h2>
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedLeads.length} of {leads.length} leads
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Sort Leads</CardTitle>
          <CardDescription>
            Find and organize your leads with advanced filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, company, email, or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filterType}
                  onValueChange={(value: any) => setFilterType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individuals</SelectItem>
                    <SelectItem value="organization">Organizations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filterStatus}
                  onValueChange={(value: any) => setFilterStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Added</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order & Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortToggle}
                    className="flex-1"
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {searchQuery && (
                  <Badge variant="secondary">Search: "{searchQuery}"</Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="secondary">Type: {filterType}</Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary">Status: {filterStatus}</Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      {filteredAndSortedLeads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No leads found</CardTitle>
            <CardDescription>
              {leads.length === 0
                ? "You haven't imported any leads yet. Use the search functionality to find and import leads."
                : "Try adjusting your search or filter criteria."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Get started by searching for leads using the AI-powered search
                interface.
              </p>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
