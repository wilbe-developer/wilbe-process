
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PATHS } from "@/lib/constants";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  register: (userData: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in on mount and set up auth listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        // If signed in, fetch user profile
        if (newSession?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
            
          if (data) {
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
          } else if (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession?.user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (data) {
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
            } else if (error) {
              console.error('Error fetching user profile:', error);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    await supabase.auth.signOut();
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate(PATHS.LOGIN);
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Transform data to match database fields
      const dbData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        linked_in: data.linkedIn,
        institution: data.institution,
        location: data.location,
        role: data.role,
        bio: data.bio,
      };
      
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

  const isAdmin = user?.isAdmin || false;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        sendMagicLink,
        register,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
