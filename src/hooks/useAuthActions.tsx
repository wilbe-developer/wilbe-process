
import { useCallback } from "react";
import { NavigateFunction } from "react-router-dom";
import { UserProfile } from "@/types";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthActionsProps {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setSession: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  toast: any;
}

export const useAuthActions = ({
  user,
  setUser,
  setSession,
  setLoading,
  navigate,
  toast
}: UseAuthActionsProps) => {
  
  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        console.log("User profile found:", data);
        // Transform database fields to match our UserProfile interface
        const userProfile: UserProfile = {
          id: data.id,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          linkedIn: data.linked_in,
          institution: data.institution,
          location: data.location,
          role: data.role,
          bio: data.bio,
          approved: data.approved,
          createdAt: new Date(data.created_at || new Date()),
          avatar: data.avatar,
          isAdmin: data.role === 'admin'
        };
        setUser(userProfile);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  // Magic link function
  const sendMagicLink = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + PATHS.HOME,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Magic link sent",
        description: "Check your email for a login link.",
      });
      
    } catch (error) {
      toast({
        title: "Failed to send magic link",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Generate a random password (won't be used with magic links)
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create new user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || "",
        password: randomPassword,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            linkedIn: userData.linkedIn,
            institution: userData.institution,
            location: userData.location,
            role: userData.role,
          },
          emailRedirectTo: window.location.origin + PATHS.PENDING,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account is pending approval. We'll notify you once approved.",
      });
      
      navigate(PATHS.PENDING);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate(PATHS.LOGIN);
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
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
      if (data.role !== undefined && !user.isAdmin) dbData.role = data.role;
      if (data.bio !== undefined) dbData.bio = data.bio;
      if (data.avatar !== undefined) dbData.avatar = data.avatar;
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local user state
      const updatedUser = {
        ...user,
        ...data,
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
    sendMagicLink,
    register,
    logout,
    updateProfile
  };
};
