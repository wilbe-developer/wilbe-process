
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { findEmails, getUniversities } from "@/services/universityService";
import { MultiSelect } from "./MultiSelect";

interface University {
  id: string;
  name: string;
  is_default: boolean;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await getUniversities();
      setUniversities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load universities",
        variant: "destructive",
      });
    }
  };

  const handleRunSearch = async () => {
    try {
      setLoading(true);
      
      const filters = {
        useCustomUniversities,
        selectedUniversities: useCustomUniversities ? selectedUniversities : undefined,
      };
      
      const results = await findEmails(filters);
      setSearchResults(results);
      
      const now = new Date();
      setLastSearchTime(now.toLocaleString());
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} potential leads`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform search",
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lead Generator</h2>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4 border rounded-md p-4">
          <h3 className="font-medium">Filters</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={useCustomUniversities}
              onCheckedChange={setUseCustomUniversities}
              id="custom-universities"
            />
            <label htmlFor="custom-universities">Use custom universities</label>
          </div>
          
          {useCustomUniversities && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Select universities to include</p>
              <MultiSelect
                options={universities.map(u => ({
                  value: u.id,
                  label: u.name
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
              {loading ? "Searching..." : "Run Search"}
            </Button>
          </div>
          
          {!useCustomUniversities && (
            <div className="text-xs text-gray-500 pt-2">
              Using {defaultUniversities.length} default universities
            </div>
          )}
        </div>
        
        <div className="col-span-3 space-y-4">
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
                {searchResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {loading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        "No results yet. Run a search to find leads."
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  searchResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>{result.institution}</TableCell>
                      <TableCell>{result.email}</TableCell>
                      <TableCell>{result.verified}</TableCell>
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
        </div>
      </div>
    </div>
  );
};

export default LeadGeneratorTab;
