
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import { findEmails, getUniversities } from "@/services/universityService";
import { MultiSelect } from "./MultiSelect";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface University {
  id: string;
  name: string;
  is_default: boolean;
  domain?: string;
}

interface LeadResult {
  name: string;
  institution: string;
  email: string;
  verified: string;
}

export const LeadGeneratorTab = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [useCustomUniversities, setUseCustomUniversities] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<LeadResult[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMissingDomains, setHasMissingDomains] = useState(false);
  const resultsPerPage = 5;
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await getUniversities();
      setUniversities(data);
      
      // Check if default universities are missing domains
      const defaultsWithoutDomains = data
        .filter(u => u.is_default && !u.domain)
        .length > 0;
      
      setHasMissingDomains(defaultsWithoutDomains);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load universities",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (useCustomUniversities) {
      // Check if selected universities are missing domains
      const missingDomains = universities
        .filter(u => selectedUniversities.includes(u.id) && !u.domain)
        .length > 0;
      
      setHasMissingDomains(missingDomains);
    }
  }, [selectedUniversities, universities, useCustomUniversities]);

  const handleRunSearch = async () => {
    try {
      setError(null);
      setLoading(true);
      setPage(1);
      
      // Check which universities will be used
      const uniList = useCustomUniversities 
        ? universities.filter(u => selectedUniversities.includes(u.id))
        : universities.filter(u => u.is_default);

      // Count universities with missing domains
      const missingDomains = uniList.filter(u => !u.domain).length;
      if (missingDomains > 0) {
        console.warn(`${missingDomains} universities in the search are missing domains`);
        
        toast({
          title: "Warning",
          description: `${missingDomains} universities are missing domain information and will be skipped.`,
          variant: "warning",
        });
      }
      
      const filters = {
        useCustomUniversities,
        selectedUniversities: useCustomUniversities ? selectedUniversities : undefined,
      };
      
      console.log("Running search with filters:", filters);
      const results = await findEmails(filters);
      setSearchResults(results);
      
      const now = new Date();
      setLastSearchTime(now.toLocaleString());
      
      if (results.length === 0) {
        toast({
          title: "No results",
          description: "No leads found. Make sure universities have domain information.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${results.length} potential leads`,
        });
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during the search");
      toast({
        title: "Error",
        description: error.message || "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteToSprint = (email: string) => {
    toast({
      title: "Invite Sent",
      description: `Invitation sent to ${email}`,
    });
  };

  const defaultUniversities = universities.filter(u => u.is_default);
  const defaultsWithoutDomains = defaultUniversities.filter(u => !u.domain);
  
  const pageCount = Math.ceil(searchResults.length / resultsPerPage);
  const paginatedResults = searchResults.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lead Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4 border rounded-md p-4">
          <h3 className="font-medium">Filters</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={useCustomUniversities}
              onCheckedChange={setUseCustomUniversities}
              id="custom-universities"
            />
            <label htmlFor="custom-universities">Use custom universities</label>
          </div>
          
          {hasMissingDomains && (
            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Some universities are missing domain information. They will be skipped during the search.
              </AlertDescription>
            </Alert>
          )}
          
          {useCustomUniversities && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Select universities to include</p>
              <MultiSelect
                options={universities.map(u => ({
                  value: u.id,
                  label: u.name + (!u.domain ? " (no domain)" : "")
                }))}
                selected={selectedUniversities}
                onChange={setSelectedUniversities}
                placeholder="Search universities..."
              />
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              onClick={handleRunSearch} 
              className="w-full"
              disabled={loading || (useCustomUniversities && selectedUniversities.length === 0)}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Searching...
                </>
              ) : "Run Search"}
            </Button>
          </div>
          
          {!useCustomUniversities && (
            <div className="text-xs text-gray-500 pt-2">
              Using {defaultUniversities.length} default universities
              {defaultUniversities.length === 0 && (
                <div className="mt-2 text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No default universities selected</span>
                </div>
              )}
              {defaultsWithoutDomains.length > 0 && (
                <div className="mt-2 text-amber-600 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span>{defaultsWithoutDomains.length} {defaultsWithoutDomains.length === 1 ? 'university has' : 'universities have'} no domain set</span>
                </div>
              )}
            </div>
          )}
        </div>
        
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
        
          {lastSearchTime && (
            <div className="text-sm text-gray-500">
              Results from: {lastSearchTime}
            </div>
          )}
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {loading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : error ? (
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
                        <Badge 
                          variant={result.verified === "Yes" ? "default" : 
                                 result.verified === "Maybe" ? "outline" : "secondary"}
                        >
                          {result.verified}
                        </Badge>
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                    className={page === pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadGeneratorTab;
