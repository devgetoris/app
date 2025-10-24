"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Mail, MapPin, Users, Phone, Globe, Linkedin, Twitter, Facebook } from "lucide-react";

interface SearchResult {
  id: string;
  recordType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  companyName?: string;
  companyDomain?: string;
  linkedinUrl?: string;
  profilePhoto?: string;
  bio?: string;
  apolloId?: string;
  // Organization fields
  name?: string;
  website?: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  revenue?: string;
  technologies?: string[];
  foundedYear?: number;
  publiclyTraded?: string;
  // Additional organization fields from Apollo data
  apolloData?: {
    organization_revenue_printed?: string;
    organization_revenue?: number;
    market_cap?: string;
    keywords?: string[];
    logo_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    facebook_url?: string;
    primary_phone?: {
      number?: string;
      sanitized_number?: string;
    };
    raw_address?: string;
    street_address?: string;
    postal_code?: string;
    alexa_ranking?: number;
    publicly_traded_symbol?: string;
    publicly_traded_exchange?: string;
    industries?: string[];
    secondary_industries?: string[];
    retail_location_count?: number;
  };
}

interface InlineSearchResultsProps {
  results: SearchResult[];
  onImportSelected: (selectedIds: string[]) => Promise<void>;
  loading?: boolean;
}

export function InlineSearchResults({
  results,
  onImportSelected,
  loading = false,
}: InlineSearchResultsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [emailFilter, setEmailFilter] = useState<string>("all");
  const router = useRouter();

  // Debug: Log the results data
  console.log("🔍 InlineSearchResults received:", results);
  if (results && results.length > 0) {
    console.log("📋 Sample result in InlineSearchResults:", JSON.stringify(results[0], null, 2));
  }

  // Filter results based on email status
  const filteredResults = results.filter(result => {
    if (emailFilter === "all") return true;
    if (emailFilter === "unlocked") return result.email && result.email !== "email_not_unlocked";
    if (emailFilter === "locked") return result.email === "email_not_unlocked";
    return true;
  });

  // Determine if we have people or organizations based on the results
  const hasPeople = results.some(result => result.recordType === "individual" || (!result.recordType && (result.firstName || result.lastName)));
  const hasOrganizations = results.some(result => result.recordType === "organization" || (!result.recordType && result.name && !result.firstName && !result.lastName));
  const resultType = hasPeople ? "people" : "organizations";

  const handleSelectAll = () => {
    const filteredIds = filteredResults.map(result => result.id);
    if (selectedIds.length === filteredIds.length && filteredIds.every(id => selectedIds.includes(id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIds);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one result to import");
      return;
    }

    try {
      setImporting(true);
      await onImportSelected(selectedIds);
      toast.success(`Successfully imported ${selectedIds.length} ${resultType}`);
      setSelectedIds([]);
      router.push("/dashboard/leads");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import selected results");
    } finally {
      setImporting(false);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>Search Results ({filteredResults.length} {resultType})</CardTitle>
            <CardDescription>
              Review and select the {resultType} you want to import to your leads.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleImport}
              disabled={selectedIds.length === 0 || importing}
              size="sm"
            >
              {importing ? "Importing..." : `Import Selected (${selectedIds.length})`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Selection Controls */}
        <div className="flex items-center justify-between p-4 border-b mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={filteredResults.length > 0 && filteredResults.every(result => selectedIds.includes(result.id))}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({selectedIds.length}/{filteredResults.length})
              </label>
            </div>
            
            {hasPeople && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Filter by email:</label>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="unlocked">Email Unlocked</SelectItem>
                    <SelectItem value="locked">Email Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((result) => {
            // Automatically detect if this is an organization or individual
            const isOrganization = result.recordType === "organization" || (!result.recordType && result.name && !result.firstName && !result.lastName);
            
            return (
              <Card key={result.id} className="relative">
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedIds.includes(result.id)}
                    onCheckedChange={() => handleSelectOne(result.id)}
                  />
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {/* Profile photo for people, logo for organizations */}
                    {!isOrganization && result.profilePhoto && (
                      <img
                        src={result.profilePhoto}
                        alt={`${result.firstName} ${result.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {isOrganization && result.apolloData?.logo_url && (
                      <img
                        src={result.apolloData.logo_url}
                        alt={result.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    )}
                    {isOrganization && !result.apolloData?.logo_url && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    {!isOrganization && !result.profilePhoto && (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium truncate">
                          {!isOrganization && result.firstName && result.lastName 
                            ? `${result.firstName} ${result.lastName}`
                            : result.name || result.companyName || "Unknown"
                          }
                        </CardTitle>
                        <Badge variant={isOrganization ? "secondary" : "default"} className="text-xs">
                          {isOrganization ? "Organization" : "Individual"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {!isOrganization ? (result.title || "Unknown") : (result.industry || "Unknown")}
                      </CardDescription>
                      {isOrganization && result.apolloData?.publicly_traded_symbol && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.apolloData.publicly_traded_symbol}
                          </Badge>
                          {result.apolloData.publicly_traded_exchange && (
                            <span className="text-xs text-gray-500">
                              {result.apolloData.publicly_traded_exchange.toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {/* Organization-specific data */}
                    {isOrganization && result.name && (
                    <>
                      {result.website && (
                        <div className="text-xs">
                          <span className="font-medium">Website:</span>
                          <a href={result.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {result.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      {result.apolloData?.organization_revenue_printed && (
                        <div className="text-xs">
                          <span className="font-medium">Revenue:</span>
                          <span className="text-green-600 ml-1 font-medium">{result.apolloData.organization_revenue_printed}</span>
                        </div>
                      )}
                      
                      {result.apolloData?.market_cap && (
                        <div className="text-xs">
                          <span className="font-medium">Market Cap:</span>
                          <span className="text-blue-600 ml-1 font-medium">{result.apolloData.market_cap}</span>
                        </div>
                      )}
                      
                      {result.foundedYear && (
                        <div className="text-xs">
                          <span className="font-medium">Founded:</span> {result.foundedYear}
                        </div>
                      )}
                      
                      {result.apolloData?.publicly_traded_symbol && (
                        <div className="text-xs">
                          <span className="font-medium">Stock:</span>
                          <span className="ml-1">{result.apolloData.publicly_traded_symbol}</span>
                          {result.apolloData.publicly_traded_exchange && (
                            <span className="text-gray-500 ml-1">({result.apolloData.publicly_traded_exchange.toUpperCase()})</span>
                          )}
                        </div>
                      )}
                      
                      {result.apolloData?.primary_phone?.number && (
                        <div className="text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span className="font-medium">Phone:</span>
                          <span>{result.apolloData.primary_phone.number}</span>
                        </div>
                      )}
                      
                      {result.apolloData?.alexa_ranking && (
                        <div className="text-xs flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className="font-medium">Alexa Rank:</span>
                          <span>#{result.apolloData.alexa_ranking.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {result.apolloData?.retail_location_count !== undefined && result.apolloData.retail_location_count > 0 && (
                        <div className="text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">Retail Locations:</span>
                          <span>{result.apolloData.retail_location_count}</span>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex items-center gap-2 pt-1">
                        {result.apolloData?.linkedin_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.apolloData?.linkedin_url, '_blank')}
                            className="text-xs h-6 px-2"
                          >
                            <Linkedin className="w-3 h-3 mr-1" />
                            LinkedIn
                          </Button>
                        )}
                        {result.apolloData?.twitter_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.apolloData?.twitter_url, '_blank')}
                            className="text-xs h-6 px-2"
                          >
                            <Twitter className="w-3 h-3 mr-1" />
                            Twitter
                          </Button>
                        )}
                        {result.apolloData?.facebook_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.apolloData?.facebook_url, '_blank')}
                            className="text-xs h-6 px-2"
                          >
                            <Facebook className="w-3 h-3 mr-1" />
                            Facebook
                          </Button>
                        )}
                      </div>
                      
                      {/* Keywords */}
                      {result.apolloData?.keywords && result.apolloData.keywords.length > 0 && (
                        <div className="pt-2">
                          <span className="text-xs font-medium text-gray-700">Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.apolloData.keywords.slice(0, 6).map((keyword: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {result.apolloData.keywords.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.apolloData.keywords.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                    {/* People-specific data */}
                    {!isOrganization && (
                    <>
                      {result.companyName && (
                        <div className="text-xs">
                          <span className="font-medium">Company:</span> {result.companyName}
                        </div>
                      )}
                      
                      {result.email && result.email !== "email_not_unlocked" && (
                        <div className="text-xs">
                          <span className="font-medium">Email:</span> 
                          <span className="text-green-600 ml-1">{result.email}</span>
                        </div>
                      )}
                      
                      {result.email === "email_not_unlocked" && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Email Not Unlocked
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            (Apollo credits required)
                          </span>
                        </div>
                      )}

                      {result.bio && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {result.bio}
                        </div>
                      )}

                      {result.linkedinUrl && (
                        <div className="text-xs">
                          <a
                            href={result.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Common data for both */}
                  {result.employeeCount && (
                    <div className="text-xs">
                      <span className="font-medium">Employees:</span> {result.employeeCount.toLocaleString()}
                    </div>
                  )}

                  {result.location && (
                    <div className="text-xs">
                      <span className="font-medium">Location:</span> {
                        [result.location.city, result.location.state, result.location.country]
                          .filter(Boolean)
                          .join(", ")
                      }
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
