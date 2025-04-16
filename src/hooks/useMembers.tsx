
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
            about: profile.about,
            approved: profile.approved || false,
            createdAt: new Date(profile.created_at || new Date()),
            avatar: profile.avatar,
            isAdmin: profile.role === 'admin',
            twitterHandle: profile.twitter_handle,
            expertise: profile.expertise,
            activityStatus: profile.activity_status,
            lastLoginDate: profile.last_login_date ? new Date(profile.last_login_date) : undefined,
            status: profile.status
          }));
          
          // Sort the members according to the specified criteria
          const sortedMembers = sortMembersByProfileCompleteness(transformedMembers);
          
          setMembers(sortedMembers);
          console.log("Fetched real member profiles:", transformedMembers.length);
        }
      } else {
        // Use sample data if not authenticated
        console.log("Not authenticated, using sample user data");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        const approvedMembers = SAMPLE_USERS.filter(user => user.approved);
        const sortedMembers = sortMembersByProfileCompleteness(approvedMembers);
        setMembers(sortedMembers);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to calculate profile completeness score
  const calculateProfileCompleteness = (member: UserProfile): number => {
    let score = 0;
    
    // Check existence of each field that indicates profile completeness
    if (member.firstName) score += 1;
    if (member.lastName) score += 1;
    if (member.email) score += 1;
    if (member.linkedIn) score += 1;
    if (member.institution) score += 1;
    if (member.location) score += 1;
    if (member.role) score += 1;
    if (member.bio || member.about) score += 1;
    if (member.twitterHandle) score += 1;
    if (member.expertise) score += 1;
    
    return score;
  };

  // Function to sort members by the specified criteria
  const sortMembersByProfileCompleteness = (memberList: UserProfile[]): UserProfile[] => {
    return [...memberList].sort((a, b) => {
      // First, prioritize members with avatars
      if (a.avatar && !b.avatar) return -1;
      if (!a.avatar && b.avatar) return 1;
      
      // Within groups (with avatar or without), sort by profile completeness
      const aCompletenessScore = calculateProfileCompleteness(a);
      const bCompletenessScore = calculateProfileCompleteness(b);
      
      if (aCompletenessScore !== bCompletenessScore) {
        return bCompletenessScore - aCompletenessScore; // Higher score first
      }
      
      // If completeness score is the same, sort by creation date (newest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

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
      member.expertise?.toLowerCase().includes(lowercaseQuery) ||
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
