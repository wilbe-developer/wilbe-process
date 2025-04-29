
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchUsersByRole, fetchUserRoles, fetchRoleCounts, mapProfilesToUserProfiles } from "./RoleUtils";

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
      console.log("Role counts:", counts);
      
      // Fetch users based on the current filter and page
      const { data: fetchedUsers, count } = await fetchUsersByRole(filter, currentPage, pageSize);
      setTotalUsers(count);
      
      // Build a role map for these users
      const userRoleMap: Record<string, UserRole[]> = {};
      
      // This is a more efficient way to get all roles for the fetched users in one go
      const userIds = fetchedUsers.map(user => user.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      if (rolesError) throw rolesError;
      
      console.log(`Fetched ${rolesData?.length || 0} roles for ${userIds.length} users`);
      
      // Process role data
      if (rolesData) {
        rolesData.forEach(row => {
          if (!userRoleMap[row.user_id]) {
            userRoleMap[row.user_id] = [];
          }
          userRoleMap[row.user_id].push(row.role as UserRole);
        });
      }
      
      // Update state with role information
      setUserRoles(userRoleMap);
      
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
