
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface UseProfileActionsProps {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export const useProfileActions = ({
  user,
  setUser,
  setLoading,
  toast
}: UseProfileActionsProps) => {
  
  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      
      // Get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setLoading(false);
        return;
      }
      
      // Check if user has admin role using our database function
      const { data: isAdminData, error: isAdminError } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      if (isAdminError) {
        console.error('Error checking admin role:', isAdminError);
      }
      
      // Check if user is approved using our database function
      const { data: isApprovedData, error: isApprovedError } = await supabase
        .rpc('is_approved', { user_id: userId });
      
      if (isApprovedError) {
        console.error('Error checking approval status:', isApprovedError);
      }
      
      const isAdmin = isAdminData || false;
      const isApproved = isApprovedData || false;
      
      console.log("Role check results:", { isAdmin, isApproved });
      
      if (profileData) {
        console.log("User profile found:", profileData, "Is admin:", isAdmin, "Is approved:", isApproved);
        // Transform database fields to match our UserProfile interface
        const userProfile: UserProfile = {
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          linkedIn: profileData.linked_in,
          institution: profileData.institution,
          location: profileData.location,
          role: profileData.role, // This is just job role, not system role
          bio: profileData.bio,
          about: profileData.about,
          approved: isApproved, // Using the role-based check only
          createdAt: new Date(profileData.created_at || new Date()),
          avatar: profileData.avatar,
          isAdmin: isAdmin, // Using the role-based check only
          twitterHandle: profileData.twitter_handle,
          expertise: profileData.expertise,
          activityStatus: profileData.activity_status,
          lastLoginDate: profileData.last_login_date ? new Date(profileData.last_login_date) : undefined,
          status: profileData.status
        };
        setUser(userProfile);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Transform data to match database fields
      const dbData: any = {};

      if (data.firstName !== undefined) dbData.first_name = data.firstName;
      if (data.lastName !== undefined) dbData.last_name = data.lastName;
      if (data.email !== undefined) dbData.email = data.email;
      if (data.linkedIn !== undefined) dbData.linked_in = data.linkedIn;
      if (data.institution !== undefined) dbData.institution = data.institution;
      if (data.location !== undefined) dbData.location = data.location;
      if (data.role !== undefined) dbData.role = data.role; // This is just job role, not access role
      if (data.bio !== undefined) dbData.bio = data.bio;
      if (data.about !== undefined) dbData.about = data.about;
      if (data.avatar !== undefined) dbData.avatar = data.avatar;
      if (data.twitterHandle !== undefined) dbData.twitter_handle = data.twitterHandle;
      if (data.expertise !== undefined) dbData.expertise = data.expertise;
      if (data.activityStatus !== undefined) dbData.activity_status = data.activityStatus;
      if (data.status !== undefined) dbData.status = data.status;
      
      // Important: Remove ability to update approval or admin status via profile updates
      // These fields are now controlled by the user_roles table
      delete dbData.approved;
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local user state - but preserve auth status fields
      const updatedUser = {
        ...user,
        ...data,
        approved: user.approved, // Preserve existing approval status
        isAdmin: user.isAdmin     // Preserve existing admin status
      };
      
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchUserProfile,
    updateProfile
  };
};
