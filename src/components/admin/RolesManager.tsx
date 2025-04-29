
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Define a type for the valid role values
type UserRole = "user" | "admin" | "member";

const RolesManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all approved profiles
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
          title: "Role Removed",
          description: `${role} role has been removed.`
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
          title: "Role Added",
          description: `${role} role has been added.`
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
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userRolesList = userRoles[user.id] || [];
                const isAdmin = userRolesList.includes("admin");
                const isMember = userRolesList.includes("user");
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userRolesList.map(role => (
                          <Badge key={role} variant="outline" className="capitalize">
                            {role}
                          </Badge>
                        ))}
                        {userRolesList.length === 0 && (
                          <span className="text-gray-500 text-sm">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant={isAdmin ? "destructive" : "outline"}
                          onClick={() => handleRoleToggle(user.id, "admin" as UserRole, isAdmin)}
                        >
                          {isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isMember ? "destructive" : "outline"}
                          onClick={() => handleRoleToggle(user.id, "user" as UserRole, isMember)}
                        >
                          {isMember ? "Remove Member" : "Make Member"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesManager;
