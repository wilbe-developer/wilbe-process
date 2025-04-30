
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getUniversities, addUniversity, updateUniversity, deleteUniversity } from "@/services/universityService";

interface University {
  id: string;
  name: string;
  is_default: boolean;
  domain?: string;
  openalex_ror?: string;
}

export const UniversityManagement = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [newUniversityName, setNewUniversityName] = useState("");
  const [newUniversityDomain, setNewUniversityDomain] = useState("");
  const [newUniversityROR, setNewUniversityROR] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await getUniversities();
      setUniversities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load universities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = async () => {
    if (!newUniversityName.trim()) {
      toast({
        title: "Error",
        description: "University name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUniversity(newUniversityName, newUniversityDomain, newUniversityROR);
      setNewUniversityName("");
      setNewUniversityDomain("");
      setNewUniversityROR("");
      toast({
        title: "Success",
        description: "University added successfully",
      });
      fetchUniversities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add university",
        variant: "destructive",
      });
    }
  };

  const handleToggleDefault = async (university: University) => {
    try {
      await updateUniversity(university.id, {
        is_default: !university.is_default,
      });
      setUniversities(
        universities.map((u) =>
          u.id === university.id
            ? { ...u, is_default: !university.is_default }
            : u
        )
      );
      toast({
        title: "Success",
        description: `University ${university.is_default ? "removed from" : "added to"} defaults`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update university",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDomain = async (university: University, domain: string) => {
    try {
      await updateUniversity(university.id, { domain });
      setUniversities(
        universities.map((u) =>
          u.id === university.id ? { ...u, domain } : u
        )
      );
      toast({
        title: "Success",
        description: "University domain updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update university domain",
        variant: "destructive",
      });
    }
  };

  const handleUpdateROR = async (university: University, openalex_ror: string) => {
    try {
      // Check if the value has changed
      if (university.openalex_ror !== openalex_ror) {
        console.log(`Updating ROR for ${university.name}: ${openalex_ror}`);
        
        // Update in database
        const result = await updateUniversity(university.id, { openalex_ror });
        console.log("Update result:", result);
        
        // Update in local state
        setUniversities(
          universities.map((u) =>
            u.id === university.id ? { ...u, openalex_ror } : u
          )
        );
        
        toast({
          title: "Success",
          description: "University OpenAlex ROR updated",
        });
      }
    } catch (error) {
      console.error("Failed to update ROR:", error);
      toast({
        title: "Error",
        description: "Failed to update university OpenAlex ROR",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUniversity = async (id: string) => {
    try {
      await deleteUniversity(id);
      setUniversities(universities.filter((u) => u.id !== id));
      toast({
        title: "Success",
        description: "University deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete university",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Default Universities</h2>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <label htmlFor="universityName" className="text-sm font-medium mb-1 block">University Name</label>
          <Input
            id="universityName"
            placeholder="New university name"
            value={newUniversityName}
            onChange={(e) => setNewUniversityName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="universityDomain" className="text-sm font-medium mb-1 block">Domain</label>
          <Input
            id="universityDomain"
            placeholder="university.edu"
            value={newUniversityDomain}
            onChange={(e) => setNewUniversityDomain(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="universityROR" className="text-sm font-medium mb-1 block">OpenAlex ROR</label>
          <Input
            id="universityROR"
            placeholder="ROR identifier"
            value={newUniversityROR}
            onChange={(e) => setNewUniversityROR(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleAddUniversity} className="w-full md:w-auto whitespace-nowrap">Add University</Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>OpenAlex ROR</TableHead>
                <TableHead className="w-[120px] text-center">Default</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No universities found
                  </TableCell>
                </TableRow>
              ) : (
                universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell>{university.name}</TableCell>
                    <TableCell>
                      <Input
                        value={university.domain || ""}
                        onChange={(e) => {
                          const updated = { ...university, domain: e.target.value };
                          setUniversities(
                            universities.map((u) => (u.id === university.id ? updated : u))
                          );
                        }}
                        placeholder="e.g., university.edu"
                        className="max-w-xs"
                        onBlur={(e) => {
                          handleUpdateDomain(university, e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={university.openalex_ror || ""}
                        onChange={(e) => {
                          const updated = { ...university, openalex_ror: e.target.value };
                          setUniversities(
                            universities.map((u) => (u.id === university.id ? updated : u))
                          );
                        }}
                        placeholder="OpenAlex ROR ID"
                        className="max-w-xs"
                        onBlur={(e) => {
                          handleUpdateROR(university, e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={university.is_default}
                        onCheckedChange={() => handleToggleDefault(university)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUniversity(university.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UniversityManagement;
