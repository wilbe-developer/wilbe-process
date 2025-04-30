
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UniversityManagement from "@/components/lead-generator/UniversityManagement";
import LeadGeneratorTab from "@/components/lead-generator/LeadGeneratorTab";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";

const LeadGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState("universities");
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!isAuthenticated || !isAdmin)) {
      console.log("LeadGeneratorPage: Redirecting to login. Auth status:", { isAuthenticated, isAdmin, loading });
      navigate(PATHS.LOGIN);
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  const handleTabChange = (value: string) => {
    try {
      setActiveTab(value);
      // Clear any previous errors when changing tabs
      setError(null);
    } catch (err) {
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
          <LeadGeneratorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadGeneratorPage;
