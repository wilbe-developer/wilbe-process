
import { useState, useEffect, useCallback } from "react";
import { SAMPLE_USERS } from "@/lib/constants";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching members, authenticated:", isAuthenticated);
      
      if (isAuthenticated) {
        // Fetch real profiles from Supabase if authenticated
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('approved', true);
          
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          // Transform database fields to match our UserProfile interface
          const transformedMembers: UserProfile[] = data.map(profile => ({
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
            createdAt: new Date(profile.created_at || new Date()),
            avatar: profile.avatar,
            isAdmin: profile.role === 'admin'
          }));
          
          setMembers(transformedMembers);
          console.log("Fetched real member profiles:", transformedMembers.length);
        }
      } else {
        // Use sample data if not authenticated
        console.log("Not authenticated, using sample user data");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        const approvedMembers = SAMPLE_USERS.filter(user => user.approved);
        setMembers(approvedMembers);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Get a member by ID
  const getMemberById = (memberId: string) => {
    return members.find(member => member.id === memberId) || null;
  };

  // Search members
  const searchMembers = (query: string) => {
    if (!query) return members;
    
    const lowercaseQuery = query.toLowerCase();
    return members.filter(member => 
      member.firstName.toLowerCase().includes(lowercaseQuery) ||
      member.lastName.toLowerCase().includes(lowercaseQuery) ||
      member.role?.toLowerCase().includes(lowercaseQuery) ||
      member.institution?.toLowerCase().includes(lowercaseQuery) ||
      member.location?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    members,
    loading,
    error,
    getMemberById,
    searchMembers,
    refreshMembers: fetchMembers
  };
};
