
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile, ApprovalStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "../roles/LoadingState";
import EmptyState from "../roles/EmptyState";

const UserApprovalsTab = () => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('approved', false);

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          const userProfiles: UserProfile[] = profileData.map(profile => ({
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            linkedIn: profile.linked_in,
            institution: profile.institution,
            location: profile.location,
            role: profile.role,
            bio: profile.bio,
            approved: profile.approved || false,
            createdAt: new Date(profile.created_at || Date.now()),
            avatar: profile.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
          }));
          setPendingUsers(userProfiles);
        }
      } catch (error) {
        console.error('Error fetching pending users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [toast]);

  const handleApprovalAction = async (userId: string, status: ApprovalStatus) => {
    try {
      // First, update the profile's approved field for backward compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ approved: status === 'approved' })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // If approving the user, add the user role
      if (status === 'approved') {
        // Add user role if approved
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: 'user' 
          }, { 
            onConflict: 'user_id,role' 
          });

        if (roleError) {
          throw roleError;
        }
      }

      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      toast({
        title: status === 'approved' ? "User Approved" : "User Rejected",
        description: `User has been ${status}. ${status === 'approved' ? 'They will be notified by email.' : ''}`,
      });
      
      console.log(`User ${userId} ${status}. This would trigger a notification to the user.`);
    } catch (error) {
      console.error('Error updating user approval status:', error);
      toast({
        title: "Error",
        description: "Failed to update user approval status",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          Review and approve new user registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState message="Loading pending approvals..." />
        ) : pendingUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        {user.firstName} {user.lastName}
                        <div className="text-sm text-gray-500">
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.institution}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApprovalAction(user.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleApprovalAction(user.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState message="No pending approvals" />
        )}
      </CardContent>
    </Card>
  );
};

export default UserApprovalsTab;
