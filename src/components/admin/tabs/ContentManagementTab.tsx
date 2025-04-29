
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoManagementForm from "./VideoManagementForm";
import ModuleManagementForm from "./ModuleManagementForm";

const ContentManagementTab = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, title')
        .order('title');

      if (modulesError) {
        throw modulesError;
      }

      if (modulesData) {
        setModules(modulesData);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [toast]);

  const handleModuleAdded = (newModule: { id: string; title: string }) => {
    setModules([...modules, newModule]);
  };

  const handleVideoAdded = () => {
    // We could refresh the video list here if needed
    toast({
      title: "Success",
      description: "Video has been added successfully",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <VideoManagementForm 
        modules={modules} 
        onVideoAdded={handleVideoAdded} 
      />
      
      <ModuleManagementForm 
        modules={modules} 
        onModuleAdded={handleModuleAdded} 
      />
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Configure external service integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Attio CRM</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              New signups are automatically added to your Attio CRM
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          
          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Slack Notifications</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Receive notifications about new signups in your Slack workspace
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          
          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">YouTube Integration</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Automatically import video metadata from YouTube
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagementTab;
