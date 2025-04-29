
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleManager } from "./roles/useRoleManager";
import UsersTable from "./roles/UsersTable";
import LoadingState from "./roles/LoadingState";
import EmptyState from "./roles/EmptyState";

const RolesManager = () => {
  const { users, loading, userRoles, handleRoleToggle } = useRoleManager();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Roles Management</CardTitle>
        <CardDescription>
          Assign and remove roles for system users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : users.length > 0 ? (
          <UsersTable 
            users={users} 
            userRoles={userRoles} 
            onRoleToggle={handleRoleToggle} 
          />
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
};

export default RolesManager;
