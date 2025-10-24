"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoadingSkeleton } from "./page-loading";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    // Set loading state when pathname changes
    if (loadingPath && loadingPath !== pathname) {
      setIsLoading(true);
      setLoadingPath(null);
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, loadingPath]);

  // Handle navigation clicks
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('http') && !link.href.startsWith('mailto:')) {
        const url = new URL(link.href);
        const newPath = url.pathname;
        
        if (newPath !== pathname) {
          setLoadingPath(newPath);
          setIsLoading(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [pathname]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return <>{children}</>;
}
