"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Route mapping for breadcrumbs
const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  emails: "Emails",
  campaigns: "Campaigns",
  automation: "Automation",
  settings: "Settings",
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard
    breadcrumbs.push({
      href: "/dashboard",
      label: "Dashboard",
      isLast: segments.length === 1 && segments[0] === "dashboard",
    });

    // Add other segments
    let currentPath = "/dashboard";
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Handle dynamic routes like [id]
      const label = segment.match(/^[0-9a-f-]{36}$/) // UUID pattern
        ? "Details"
        : routeMap[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        href: currentPath,
        label,
        isLast: i === segments.length - 1,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <Home className="h-4 w-4" />}
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={breadcrumb.href}
                    className="flex items-center gap-1"
                  >
                    {index === 0 && <Home className="h-4 w-4" />}
                    {breadcrumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!breadcrumb.isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
