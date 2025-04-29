
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleManager } from "./roles/useRoleManager";
import UsersTable from "./roles/UsersTable";
import LoadingState from "./roles/LoadingState";
import EmptyState from "./roles/EmptyState";
import UserRoleFilter from "./roles/UserRoleFilter";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const RolesManager = () => {
  const { 
    users, 
    loading, 
    userRoles, 
    handleRoleToggle, 
    filter, 
    handleFilterChange,
    currentPage,
    totalPages,
    handlePageChange,
    roleCounts
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
            <UserRoleFilter 
              filter={filter} 
              onFilterChange={handleFilterChange} 
              roleCounts={roleCounts}
            />
            
            {users.length > 0 ? (
              <>
                <UsersTable 
                  users={users} 
                  userRoles={userRoles} 
                  onRoleToggle={handleRoleToggle} 
                />
                
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
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
