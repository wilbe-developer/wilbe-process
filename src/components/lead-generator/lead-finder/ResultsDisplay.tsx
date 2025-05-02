
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LeadResult, TopicOption } from "./types";

interface ResultsDisplayProps {
  searchResults: LeadResult[];
  page: number;
  setPage: (page: number) => void;
  lastSearchTime: string | null;
  topicId: string;
  topicOptions: TopicOption[];
  loading: boolean;
  error: string | null;
  apiError: string | null;
  handleInviteToSprint: (email: string) => void;
  formatDate: (date?: string) => string;
  resultsPerPage: number;
}

export const ResultsDisplay = ({
  searchResults,
  page,
  setPage,
  lastSearchTime,
  topicId,
  topicOptions,
  loading,
  error,
  apiError,
  handleInviteToSprint,
  formatDate,
  resultsPerPage
}: ResultsDisplayProps) => {
  const pageCount = Math.ceil(searchResults.length / resultsPerPage);
  const paginatedResults = searchResults.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );
  
  // Get the topic label for display
  const getTopicLabel = (id: string) => {
    const topic = topicOptions.find(t => t.value === id);
    return topic ? topic.label : id;
  };

  // Helper to determine badge variant based on verification status
  const getBadgeVariant = (verified: string) => {
    switch (verified) {
      case "ok":
        return "default";
      case "risky":
        return "outline";
      case "invalid":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="md:col-span-3 space-y-4">
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
          <h4 className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error
          </h4>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {apiError && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-800">
          <h4 className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            API Warning
          </h4>
          <p className="mt-1">{apiError}</p>
        </div>
      )}
    
      {lastSearchTime && (
        <div className="text-sm text-gray-500">
          Results from: {lastSearchTime}
          {topicId && topicId !== "no-filter" && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Topic filter: {getTopicLabel(topicId)}
            </span>
          )}
        </div>
      )}
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>ORCID</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Last Verified</TableHead>
              <TableHead>Last Failed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : error || apiError ? (
                    <span>Search failed. Please try again.</span>
                  ) : lastSearchTime ? (
                    <span>No results found for your search criteria. Make sure universities have domain information set.</span>
                  ) : (
                    <span>No results yet. Run a search to find leads.</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.institution}</TableCell>
                  <TableCell>
                    <a 
                      href={`mailto:${result.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {result.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    {result.orcid ? (
                      <a 
                        href={`https://orcid.org/${result.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {result.orcid}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getBadgeVariant(result.verified)}
                    >
                      {result.verified}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {result.reason || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(result.last_verified_at)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(result.last_failed_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInviteToSprint(result.email)}
                    >
                      Invite to Sprint
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {pageCount > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: pageCount }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                className={page === pageCount ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ResultsDisplay;
