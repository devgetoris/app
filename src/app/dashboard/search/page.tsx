import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LeadsSearchInterface } from "@/components/leads/leads-search-interface";

export default async function SearchPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find New Leads</h1>
          <p className="text-muted-foreground mt-2">
            Use AI to search for people and organizations in natural language
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <LeadsSearchInterface />
    </div>
  );
}
