
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
        
        // Update state with role information
        setUserRoles(roleMap);
        
        // Update user profiles with role information
        const enhancedProfiles = userProfiles.map(profile => ({
          ...profile,
          approved: roleMap[profile.id]?.includes("user") || false,
          isAdmin: roleMap[profile.id]?.includes("admin") || false
        }));
        
        setUsers(enhancedProfiles);
        // Initially set filtered users to all users
        applyFilter(enhancedProfiles, filter);
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

  const applyFilter = (userList: UserProfile[], filterValue: UserRole | 'all') => {
    if (filterValue === 'all') {
      setFilteredUsers(userList);
      return;
    }
    
    const filtered = userList.filter(user => {
      const userRoleList = userRoles[user.id] || [];
      return userRoleList.includes(filterValue as UserRole);
    });
    
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (newFilter: UserRole | 'all') => {
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
