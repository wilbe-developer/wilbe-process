
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
}

export const UniversityManagement = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [newUniversityName, setNewUniversityName] = useState("");
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
      await addUniversity(newUniversityName);
      setNewUniversityName("");
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
      
      <div className="flex gap-2">
        <Input
          placeholder="New university name"
          value={newUniversityName}
          onChange={(e) => setNewUniversityName(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleAddUniversity}>Add University</Button>
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
                <TableHead className="w-[150px] text-center">Default</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No universities found
                  </TableCell>
                </TableRow>
              ) : (
                universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell>{university.name}</TableCell>
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
