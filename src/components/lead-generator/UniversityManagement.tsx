
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUniversities, updateUniversity, deleteUniversity } from "@/services/universityService";
import { UniversityForm } from "./university/UniversityForm";
import { UniversityTable } from "./university/UniversityTable";
import { University } from "./university/types";

export const UniversityManagement = () => {
  const [universities, setUniversities] = useState<University[]>([]);
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
      console.log(`Attempting to update ROR for ${university.name} from "${university.openalex_ror}" to "${openalex_ror}"`);
      
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
      
      <UniversityForm onUniversityAdded={fetchUniversities} />
      
      <UniversityTable
        universities={universities}
        loading={loading}
        onToggleDefault={handleToggleDefault}
        onUpdateDomain={handleUpdateDomain}
        onUpdateROR={handleUpdateROR}
        onDelete={handleDeleteUniversity}
      />
    </div>
  );
};

export default UniversityManagement;
