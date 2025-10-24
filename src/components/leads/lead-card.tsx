"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  DollarSign, 
  TrendingUp, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Github,
  ExternalLink,
  Briefcase,
  Calendar
} from "lucide-react";


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
}

export function LeadCard({ lead }: { lead: Lead }) {
  const isOrganization = lead.recordType === "organization";
  const displayName = isOrganization 
    ? lead.companyName || "Organization" 
    : `${lead.firstName || ""} ${lead.lastName || ""}`.trim();

  // Helper function to format company size
  const formatCompanySize = (size: string | null) => {
    if (!size) return null;
    const numSize = parseInt(size);
    if (isNaN(numSize)) return size;
    
    if (numSize >= 1000) {
      return `${(numSize / 1000).toFixed(1)}k employees`;
    }
    return `${numSize} employees`;
  };

  // Helper function to get location string
  const getLocationString = () => {
    const parts = [lead.companyCity, lead.companyState, lead.companyCountry].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : lead.companyLocation;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
            {isOrganization ? (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
            ) : (
              <>
                {lead.profilePhoto ? (
                  <img
                    src={lead.profilePhoto}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                    {`${lead.firstName?.[0] || ""}${lead.lastName?.[0] || ""}`}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{displayName}</h3>
              <Badge variant={isOrganization ? "secondary" : "default"} className="text-xs">
                {isOrganization ? "Organization" : "Individual"}
              </Badge>
            </div>
            {!isOrganization && lead.title && (
              <p className="text-sm text-muted-foreground truncate">
                {lead.title}
              </p>
            )}
            {isOrganization && lead.companyIndustry && (
              <p className="text-sm text-muted-foreground truncate">
                {lead.companyIndustry}
              </p>
            )}
            {!isOrganization && lead.companyName && (
              <p className="text-sm text-muted-foreground truncate">
                {lead.companyName}
              </p>
            )}
            
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isOrganization ? (
          /* Organization-specific content */
          <>
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 gap-3">
              {lead.companySize && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{formatCompanySize(lead.companySize)}</span>
                </div>
              )}
              {lead.companyRevenue && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">{lead.companyRevenue}</span>
                </div>
              )}
            </div>

            {/* Location */}
            {getLocationString() && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{getLocationString()}</span>
              </div>
            )}

            {/* Website */}
            {lead.companyDomain && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Website:</span>
                <a
                  href={`https://${lead.companyDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {lead.companyDomain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Technologies */}
            {lead.companyTechnologies && lead.companyTechnologies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Technologies:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lead.companyTechnologies.slice(0, 4).map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {lead.companyTechnologies.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{lead.companyTechnologies.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Funding Status */}
            {lead.companyFunding && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Funding:</span>
                <span className="font-medium">{lead.companyFunding}</span>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2 border-t">
              {lead.linkedinUrl && (
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {lead.twitterUrl && (
                <a
                  href={lead.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {lead.facebookUrl && (
                <a
                  href={lead.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {lead.githubUrl && (
                <a
                  href={lead.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </>
        ) : (
          /* Individual-specific content */
          <>
            {/* Contact Info */}
            {lead.email && !lead.email.includes("email_not_unlocked") && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{lead.email}</span>
              </div>
            )}

            {/* Company Info */}
            {lead.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{lead.companyName}</span>
              </div>
            )}

            {/* Location */}
            {getLocationString() && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{getLocationString()}</span>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {lead.linkedinUrl && (
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {lead.twitterUrl && (
                <a
                  href={lead.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
            </div>
          </>
        )}

        {/* Status and Actions */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant={lead.status === "new" ? "default" : "secondary"}>
              {lead.status || "new"}
            </Badge>
            {lead.fitScore && (
              <Badge variant="outline">Fit Score: {lead.fitScore}</Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/leads/${lead.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View Profile
              </Button>
            </Link>
            <Button variant="default" className="flex-1" size="sm">
              Generate Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}