
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useRoleManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [filter, setFilter] = useState<UserRole | 'all'>('all');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profileError) throw profileError;
      
      console.log(`Fetched ${profileData?.length || 0} user profiles`);
      
      if (profileData) {
        // Transform profiles to UserProfile format
        const userProfiles = profileData.map(profile => ({
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          linkedIn: profile.linked_in,
          institution: profile.institution,
          location: profile.location,
          role: profile.role,
          bio: profile.bio,
          approved: false, // We'll get this from roles
          createdAt: new Date(profile.created_at || Date.now()),
          avatar: profile.avatar
        }));
        
        // Fetch roles for all users
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        if (rolesError) throw rolesError;
        
        console.log(`Fetched ${rolesData?.length || 0} user role entries`);
        console.log('Role data sample:', rolesData?.slice(0, 5));
        
        // Create a map of user_id -> roles array
        const roleMap: Record<string, UserRole[]> = {};
        
        if (rolesData) {
          rolesData.forEach(row => {
            if (!roleMap[row.user_id]) {
              roleMap[row.user_id] = [];
            }
            // Ensure the role is one of the valid enum values
            const role = row.role as UserRole;
            roleMap[row.user_id].push(role);
          });
        }
        
        console.log('Full role map:', roleMap);
        
        // Update state with role information
        setUserRoles(roleMap);
        
        // Update user profiles with role information
        const enhancedProfiles = userProfiles.map(profile => ({
          ...profile,
          approved: roleMap[profile.id]?.includes("user") || false,
          isAdmin: roleMap[profile.id]?.includes("admin") || false
        }));
        
        console.log('Enhanced profiles with roles:', enhancedProfiles.slice(0, 5));
        console.log(`Admin count: ${enhancedProfiles.filter(p => p.isAdmin).length}`);
        
        setUsers(enhancedProfiles);
        // Initially set filtered users to all users
        applyFilter(enhancedProfiles, filter, roleMap);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (userList: UserProfile[], filterValue: UserRole | 'all', roleMapData?: Record<string, UserRole[]>) => {
    // Use the provided roleMap or fall back to the state
    const roleMapToUse = roleMapData || userRoles;
    
    if (filterValue === 'all') {
      console.log(`Filter "all" applied - showing all ${userList.length} users`);
      setFilteredUsers(userList);
      return;
    }
    
    console.log(`Filtering by role: ${filterValue}`);
    
    // Log all users who have the admin role in roleMap
    if (filterValue === 'admin') {
      const adminUserIds = Object.entries(roleMapToUse)
        .filter(([_, roles]) => roles.includes('admin'))
        .map(([userId]) => userId);
      console.log(`Users with admin role in roleMap (${adminUserIds.length}):`, adminUserIds);
    }
    
    const filtered = userList.filter(user => {
      const userRoleList = roleMapToUse[user.id] || [];
      const hasRole = userRoleList.includes(filterValue as UserRole);
      if (filterValue === 'admin' && hasRole) {
        console.log(`User ${user.id} (${user.firstName} ${user.lastName}) has admin role`);
      }
      return hasRole;
    });
    
    console.log(`Filter "${filterValue}" applied - showing ${filtered.length} users`);
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (newFilter: UserRole | 'all') => {
    console.log(`Changing filter from ${filter} to ${newFilter}`);
    setFilter(newFilter);
    applyFilter(users, newFilter);
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
      
      // Refresh roles
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    filteredUsers,
    loading,
    userRoles,
    filter,
    handleRoleToggle,
    handleFilterChange,
    fetchUsers
  };
};
