
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleManager } from "./roles/useRoleManager";
import UsersTable from "./roles/UsersTable";
import LoadingState from "./roles/LoadingState";
import EmptyState from "./roles/EmptyState";
import UserRoleFilter from "./roles/UserRoleFilter";

const RolesManager = () => {
  const { 
    filteredUsers, 
    loading, 
    userRoles, 
    handleRoleToggle, 
    filter, 
    handleFilterChange 
  } = useRoleManager();

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
        ) : (
          <>
            <UserRoleFilter filter={filter} onFilterChange={handleFilterChange} />
            
            {filteredUsers.length > 0 ? (
              <UsersTable 
                users={filteredUsers} 
                userRoles={userRoles} 
                onRoleToggle={handleRoleToggle} 
              />
            ) : (
              <EmptyState />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesManager;
