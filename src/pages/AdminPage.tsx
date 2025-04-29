
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserApprovalsTab from "../components/admin/tabs/UserApprovalsTab";
import RolesManager from "../components/admin/RolesManager";
import ContentManagementTab from "../components/admin/tabs/ContentManagementTab";
import PlatformSettingsTab from "../components/admin/tabs/PlatformSettingsTab";

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  if (!isAdmin) {
    navigate(PATHS.HOME);
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage user approvals, content, and platform settings
        </p>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
};

export default AdminPage;
