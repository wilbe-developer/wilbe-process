
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserApprovalsTab from "../components/admin/tabs/UserApprovalsTab";
import RolesManager from "../components/admin/RolesManager";
import ContentManagementTab from "../components/admin/tabs/ContentManagementTab";
import PlatformSettingsTab from "../components/admin/tabs/PlatformSettingsTab";
import SprintActivityTab from "../components/admin/tabs/SprintActivityTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("approvals");

  // Redirect non-admin users
  if (!isAdmin) {
    navigate(PATHS.HOME);
    return null;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage user approvals, content, and platform settings
        </p>
      </div>

      {isMobile ? (
        <div className="mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approvals">User Approvals</SelectItem>
              <SelectItem value="roles">User Roles</SelectItem>
              <SelectItem value="content">Content Management</SelectItem>
              <SelectItem value="settings">Platform Settings</SelectItem>
              <SelectItem value="sprint">Sprint Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {!isMobile && (
          <TabsList className="mb-6">
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="roles">User Roles</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
            <TabsTrigger value="sprint">Sprint Activity</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="approvals">
          <UserApprovalsTab />
        </TabsContent>

        <TabsContent value="roles">
          <RolesManager />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagementTab />
        </TabsContent>

        <TabsContent value="settings">
          <PlatformSettingsTab />
        </TabsContent>

        <TabsContent value="sprint">
          <SprintActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
