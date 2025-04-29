
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UniversityManagement from "@/components/lead-generator/UniversityManagement";
import LeadGeneratorTab from "@/components/lead-generator/LeadGeneratorTab";

const LeadGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState("universities");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lead Generator</h1>
        <p className="text-gray-600">
          Find and manage potential leads based on university filters
        </p>
      </div>

      <Tabs 
        defaultValue="universities" 
        value={activeTab} 
        onValueChange={setActiveTab}
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
