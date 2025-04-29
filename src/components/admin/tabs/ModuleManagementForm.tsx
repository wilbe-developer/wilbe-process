
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ModuleManagementFormProps {
  modules: { id: string; title: string }[];
  onModuleAdded: (newModule: { id: string; title: string }) => void;
}

const ModuleManagementForm = ({ modules, onModuleAdded }: ModuleManagementFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [moduleName, setModuleName] = useState("");

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!moduleName) {
        toast({
          title: "Module Name Required",
          description: "Please enter a module name",
          variant: "destructive"
        });
        return;
      }
      
      const slug = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          title: moduleName,
          slug: slug,
          description: `Content related to ${moduleName}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      onModuleAdded({ id: data.id, title: data.title });
      
      toast({
        title: "Module Added",
        description: "The new module has been created.",
      });
      
      setModuleName("");
      
    } catch (error) {
      console.error("Error adding module:", error);
      toast({
        title: "Error",
        description: "Failed to add module. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Module</CardTitle>
        <CardDescription>
          Create a new module to organize videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddModule} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moduleName">Module Name</Label>
            <Input
              id="moduleName"
              placeholder="E.g. Lab Skills, Research Funding"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Add Module
          </Button>
        </form>
        
        <div className="mt-8">
          <h3 className="font-medium mb-2">Available Modules</h3>
          {modules.length > 0 ? (
            <div className="space-y-2">
              {modules.map(module => (
                <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{module.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No modules created yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleManagementForm;
