"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  title: string | null;
  companyName: string | null;
  companyIndustry: string | null;
  companySize: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  profilePhoto: string | null;
  status: string | null;
  fitScore: number | null;
}

export function LeadCard({ lead }: { lead: Lead }) {
  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
            {lead.profilePhoto ? (
              <Image
                src={lead.profilePhoto}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                {lead.firstName?.[0]}
                {lead.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{fullName}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {lead.title}
            </p>
            {lead.companyName && (
              <p className="text-sm text-muted-foreground truncate">
                {lead.companyName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Details */}
        <div className="space-y-2">
          {lead.companyIndustry && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Industry:</span>
              <span>{lead.companyIndustry}</span>
            </div>
          )}
          {lead.companySize && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Size:</span>
              <span>{lead.companySize} employees</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {lead.email && (
          <div className="text-sm text-muted-foreground truncate">
            {lead.email}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={lead.status === "new" ? "default" : "secondary"}>
            {lead.status || "new"}
          </Badge>
          {lead.fitScore && (
            <Badge variant="outline">Fit Score: {lead.fitScore}</Badge>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-2">
          {lead.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              LinkedIn
            </a>
          )}
          {lead.twitterUrl && (
            <a
              href={lead.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 text-sm"
            >
              Twitter
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/leads/${lead.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              View Profile
            </Button>
          </Link>
          <Button variant="default" className="flex-1" size="sm">
            Generate Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
