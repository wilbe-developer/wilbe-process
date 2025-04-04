
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PATHS, SAMPLE_USERS } from "@/lib/constants";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email
      const foundUser = SAMPLE_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // In a real app, you would check the password here
      
      // Check if the user is approved
      if (!foundUser.approved) {
        toast({
          title: "Account pending approval",
          description: "Your account is still pending approval. You'll be notified once approved.",
          variant: "destructive",
        });
        navigate(PATHS.PENDING);
        return;
      }
      
      // Add isAdmin field for test purposes
      const userWithRole = {
        ...foundUser,
        isAdmin: foundUser.id === '1', // First user is admin for demo
      };
      
      setUser(userWithRole);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.firstName}!`,
      });
      
      navigate(PATHS.HOME);
    } catch (error) {
      toast({
        title: "Login failed",
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
      
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new user
      const newUser: UserProfile = {
        id: Math.random().toString(36).substring(2, 11),
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        linkedIn: userData.linkedIn || "",
        institution: userData.institution || "",
        location: userData.location || "",
        role: userData.role || "",
        bio: userData.bio || "",
        approved: false, // Users start unapproved
        createdAt: new Date(),
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      };
      
      // In a real app, you would add the user to the database here
      // and trigger notifications to Admin, Slack, Attio CRM, etc.
      
      toast({
        title: "Registration successful",
        description: "Your account is pending approval. We'll notify you once approved.",
      });
      
      console.log("New user registered:", newUser);
      console.log("This would trigger a notification to Admin, Slack, and Attio CRM");
      
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
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
      
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = {
        ...user,
        ...data,
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
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
        login,
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
