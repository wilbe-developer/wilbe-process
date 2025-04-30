
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { addUniversity } from "@/services/universityService";

export const UniversityForm = ({ onUniversityAdded }: { onUniversityAdded: () => void }) => {
  const [newUniversityName, setNewUniversityName] = useState("");
  const [newUniversityDomain, setNewUniversityDomain] = useState("");
  const [newUniversityROR, setNewUniversityROR] = useState("");
  const { toast } = useToast();

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
      onUniversityAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add university",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};

export default UniversityForm;
