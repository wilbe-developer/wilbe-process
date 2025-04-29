
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleManager } from "./roles/useRoleManager";
import UsersTable from "./roles/UsersTable";
import LoadingState from "./roles/LoadingState";
import EmptyState from "./roles/EmptyState";
import UserRoleFilter from "./roles/UserRoleFilter";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

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

  // Generate pagination items with a reasonable range
  const generatePaginationItems = () => {
    // Always show first page, last page, current page, and 2 pages before and after current page
    const items = [];
    const maxPageItemsToShow = 7; // Max number of page numbers to show
    
    if (totalPages <= maxPageItemsToShow) {
      // If total pages is less than or equal to max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to show up to 3 pages in the middle
      while (endPage - startPage < 2 && endPage < totalPages - 1) {
        endPage++;
      }
      while (endPage - startPage < 2 && startPage > 2) {
        startPage--;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        items.push('ellipsis-start');
      }
      
      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push('ellipsis-end');
      }
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };

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
                        
                        {generatePaginationItems().map((page, index) => {
                          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                            return (
                              <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => handlePageChange(page as number)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
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
