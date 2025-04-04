
import { useState, useEffect } from "react";
import { SAMPLE_USERS } from "@/lib/constants";
import { UserProfile } from "@/types";

export const useMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch these from an API
        // Only include approved members
        const approvedMembers = SAMPLE_USERS.filter(user => user.approved);
        
        setMembers(approvedMembers);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

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
  };
};
