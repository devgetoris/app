"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  companyName: string;
  companyDomain: string;
  linkedinUrl: string;
  profilePhoto: string;
  bio: string;
  apolloId: string;
}

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  searchType: "people" | "organizations";
  onImportSelected: (selectedIds: string[]) => Promise<void>;
  loading?: boolean;
}

export function SearchResultsModal({
  isOpen,
  onClose,
  results,
  searchType,
  onImportSelected,
  loading = false,
}: SearchResultsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [emailFilter, setEmailFilter] = useState<string>("all");
  const router = useRouter();

  // Filter results based on email status
  const filteredResults = results.filter(result => {
    if (emailFilter === "all") return true;
    if (emailFilter === "unlocked") return result.email && result.email !== "email_not_unlocked";
    if (emailFilter === "locked") return result.email === "email_not_unlocked";
    return true;
  });

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
      toast.success(`Successfully imported ${selectedIds.length} ${searchType === "people" ? "people" : "organizations"}`);
      onClose();
      setSelectedIds([]);
      router.push("/dashboard/leads");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import selected results");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Search Results ({filteredResults.length} of {results.length} {searchType === "people" ? "people" : "organizations"} shown)
          </DialogTitle>
          <DialogDescription>
            Review and select the {searchType === "people" ? "people" : "organizations"} you want to import to your leads.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Selection Controls */}
          <div className="flex items-center justify-between p-4 border-b">
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
              
              {searchType === "people" && (
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
            <div className="flex items-center gap-2">
              <Button
                onClick={handleImport}
                disabled={selectedIds.length === 0 || importing}
                size="sm"
              >
                {importing ? "Importing..." : `Import Selected (${selectedIds.length})`}
              </Button>
              <Button variant="outline" onClick={handleClose} size="sm">
                Cancel
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {results.length === 0 ? "No results found" : "No results match the current filter"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="relative">
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedIds.includes(result.id)}
                        onCheckedChange={() => handleSelectOne(result.id)}
                      />
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {result.profilePhoto && (
                          <img
                            src={result.profilePhoto}
                            alt={`${result.firstName} ${result.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {result.firstName} {result.lastName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {result.title}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-2">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
