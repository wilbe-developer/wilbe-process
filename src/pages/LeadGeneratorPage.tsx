
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UniversityManagement from "@/components/lead-generator/UniversityManagement";
import LeadGeneratorTab from "@/components/lead-generator/LeadGeneratorTab";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

const LeadGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState("universities");
  const [error, setError] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Debug mounting
  useEffect(() => {
    console.log("LeadGeneratorPage mounted");
    return () => console.log("LeadGeneratorPage unmounted");
  }, []);

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading) {
      console.log("LeadGeneratorPage: Auth status:", { isAuthenticated, isAdmin, loading });
      
      if (!isAuthenticated) {
        console.log("LeadGeneratorPage: Redirecting to login. Not authenticated.");
        navigate(PATHS.LOGIN);
      } else if (!isAdmin) {
        console.log("LeadGeneratorPage: Redirecting to home. Not admin.");
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        navigate(PATHS.HOME);
      } else {
        setIsPageLoaded(true);
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, toast]);

  const handleTabChange = (value: string) => {
    try {
      console.log(`Changing tab to: ${value}`);
      setActiveTab(value);
      // Clear any previous errors when changing tabs
      setError(null);
    } catch (err: any) {
      console.error("Error changing tabs:", err);
      setError("An error occurred while changing tabs. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  // This prevents flashing content before redirect
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lead Generator</h1>
        <p className="text-gray-600">
          Find and manage potential leads based on university filters
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="universities" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="universities">University Management</TabsTrigger>
          <TabsTrigger value="generator">Lead Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <UniversityManagement />
        </TabsContent>

        <TabsContent value="generator">
          {isPageLoaded ? (
            <LeadGeneratorTab />
          ) : (
            <div className="py-12 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadGeneratorPage;
