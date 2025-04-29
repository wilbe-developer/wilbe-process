
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches users with specified role using separate queries instead of a JOIN
 */
export const fetchUsersByRole = async (role: UserRole | 'all', page = 1, pageSize = 20) => {
  try {
    // First, fetch profiles with pagination
    let profilesQuery = supabase.from('profiles')
      .select('*', { count: 'exact' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: profiles, error: profilesError, count } = await profilesQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    if (profilesError) throw profilesError;
    
    if (!profiles || profiles.length === 0) {
      console.log("No profiles found");
      return { 
        data: [], 
        count: 0 
      };
    }
    
    // Get IDs of all fetched profiles to get their roles
    const profileIds = profiles.map(profile => profile.id);
    
    // Next, fetch user roles separately for these specific profiles
    let { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', profileIds);
    
    if (rolesError) throw rolesError;
    
    // Create a map of user_id to roles for easier access
    const userRoleMap: Record<string, UserRole[]> = {};
    userRoles?.forEach(ur => {
      if (!userRoleMap[ur.user_id]) {
        userRoleMap[ur.user_id] = [];
      }
      userRoleMap[ur.user_id].push(ur.role as UserRole);
    });
    
    // If we're filtering by role other than 'all', fetch additional profiles
    // specifically with this role (to solve the admin visibility issue)
    let filteredProfiles = profiles;
    
    if (role !== 'all') {
      // Special handling for role-specific filtering
      // First get all the user IDs that have this specific role
      const { data: usersWithRole, error: roleFilterError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', role)
        .range(from, to);
        
      if (roleFilterError) throw roleFilterError;
      
      if (usersWithRole && usersWithRole.length > 0) {
        // Get user IDs from the role-specific query
        const userIdsWithRole = usersWithRole.map(ur => ur.user_id);
        
        // Fetch profiles for those specific users
        const { data: roleFilteredProfiles, error: filteredProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIdsWithRole)
          .order('created_at', { ascending: false });
          
        if (filteredProfilesError) throw filteredProfilesError;
        
        if (roleFilteredProfiles && roleFilteredProfiles.length > 0) {
          filteredProfiles = roleFilteredProfiles;
          
          // Update the user IDs list to get roles for the new profiles
          const newProfileIds = roleFilteredProfiles.map(profile => profile.id);
          
          // Fetch roles for these specific profiles
          const { data: addlUserRoles, error: addlRolesError } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('user_id', newProfileIds);
            
          if (addlRolesError) throw addlRolesError;
          
          // Add to the role map
          addlUserRoles?.forEach(ur => {
            if (!userRoleMap[ur.user_id]) {
              userRoleMap[ur.user_id] = [];
            }
            userRoleMap[ur.user_id].push(ur.role as UserRole);
          });
        }
      }
      
      // Get the count of users with this specific role for accurate pagination
      const { count: roleCount, error: roleCountError } = await supabase
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', role);
        
      if (roleCountError) throw roleCountError;
      
      console.log(`Fetched ${filteredProfiles.length} profiles with role: ${role}. Total: ${roleCount || 0}`);
      
      return { 
        data: filteredProfiles, 
        count: roleCount || 0,
        userRoleMap
      };
    }
    
    console.log(`Fetched ${filteredProfiles.length} profiles with role: ${role}. Total: ${count || 0}`);
    
    return { 
      data: filteredProfiles, 
      count: count || 0,
      userRoleMap
    };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

/**
 * Fetches all roles for a specific user
 */
export const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return (data || []).map(row => row.role as UserRole);
  } catch (error) {
    console.error(`Error fetching roles for user ${userId}:`, error);
    return [];
  }
};

/**
 * Counts users by role type
 */
export const fetchRoleCounts = async (): Promise<Record<UserRole | 'all', number>> => {
  try {
    // Get total user count from profiles table
    const { count: totalCount, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get admin count
    const { count: adminCount, error: adminError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    
    if (adminError) throw adminError;
    
    // Get user role count
    const { count: userCount, error: userError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');
    
    if (userError) throw userError;
    
    console.log("Role counts:", {
      'all': totalCount || 0,
      'admin': adminCount || 0,
      'user': userCount || 0
    });
    
    return {
      'all': totalCount || 0,
      'admin': adminCount || 0,
      'user': userCount || 0
    };
  } catch (error) {
    console.error("Error fetching role counts:", error);
    return { 'all': 0, 'admin': 0, 'user': 0 };
  }
};

/**
 * Maps database profiles to UserProfile objects
 */
export const mapProfilesToUserProfiles = (profiles: any[], roleMap: Record<string, UserRole[]> = {}): UserProfile[] => {
  return profiles.map(profile => ({
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    linkedIn: profile.linked_in,
    institution: profile.institution,
    location: profile.location,
    role: profile.role,
    bio: profile.bio,
    approved: roleMap[profile.id]?.includes("user") || false,
    isAdmin: roleMap[profile.id]?.includes("admin") || false,
    createdAt: new Date(profile.created_at || Date.now()),
    avatar: profile.avatar
  }));
};
