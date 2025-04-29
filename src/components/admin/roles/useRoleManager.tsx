
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchUsersByRole, fetchRoleCounts, mapProfilesToUserProfiles } from "./RoleUtils";

export const useRoleManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [filter, setFilter] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleCounts, setRoleCounts] = useState<Record<UserRole | 'all', number>>({
    'all': 0,
    'admin': 0,
    'user': 0
  });
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get role counts for filter indicators
      const counts = await fetchRoleCounts();
      setRoleCounts(counts);
      
      // Special handling for admin filter which needs a different approach
      try {
        let fetchedUsers, count, userRoleMap;
        
        // Fetch users based on the current filter and page
        ({ data: fetchedUsers, count, userRoleMap } = await fetchUsersByRole(filter, currentPage, pageSize));
        
        setTotalUsers(count);
        
        // Update user roles state
        setUserRoles(userRoleMap || {});
        
        // Map to UserProfile format with role information
        const enhancedProfiles = mapProfilesToUserProfiles(fetchedUsers, userRoleMap);
        
        console.log(`Successfully processed ${enhancedProfiles.length} user profiles`);
        console.log(`Admin count in current page: ${enhancedProfiles.filter(p => p.isAdmin).length}`);
        
        setUsers(enhancedProfiles);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in useRoleManager:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, toast]);

  const handleFilterChange = (newFilter: UserRole | 'all') => {
    console.log(`Changing filter from ${filter} to ${newFilter}`);
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRoleToggle = async (userId: string, role: UserRole, hasRole: boolean) => {
    try {
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
          
        if (error) throw error;
        
        toast({
          title: role === "admin" ? "Admin Role Removed" : "Member Access Revoked",
          description: role === "admin" 
            ? "Admin privileges have been removed."
            : "Member access has been revoked."
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });
          
        if (error) throw error;
        
        toast({
          title: role === "admin" ? "Admin Role Added" : "Member Access Granted",
          description: role === "admin" 
            ? "Admin privileges have been added."
            : "Member access has been granted."
        });
      }
      
      // Refresh users
      fetchUsers();
      
      // Also update role counts
      const counts = await fetchRoleCounts();
      setRoleCounts(counts);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    userRoles,
    filter,
    handleRoleToggle,
    handleFilterChange,
    fetchUsers,
    currentPage,
    totalPages: Math.ceil(totalUsers / pageSize),
    handlePageChange,
    roleCounts
  };
};
