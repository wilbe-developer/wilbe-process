
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";

export interface TeamMember {
  name: string;
  profile: string;
  employmentStatus: string;
  triggerPoints: string;
}

// Helper function to ensure TeamMember objects are JSON serializable
export const serializeTeamMembers = (teamMembers: TeamMember[]): Json => {
  // Convert TeamMember objects to a plain object structure
  // This ensures they're properly serializable for Supabase
  return JSON.parse(JSON.stringify(teamMembers)) as Json;
};

export const useTeamMembers = (taskAnswers: any) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ 
    name: '', 
    profile: '', 
    employmentStatus: '',
    triggerPoints: '' 
  }]);
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load team members from taskAnswers when available (this is from sprint progress)
  useEffect(() => {
    if (taskAnswers?.team_members && !initialDataLoaded) {
      console.log("Loading team members from task answers:", taskAnswers.team_members);
      setTeamMembers(taskAnswers.team_members);
      setInitialDataLoaded(true);
    }
  }, [taskAnswers, initialDataLoaded]);

  // If no task answers, try loading from team_members table
  useEffect(() => {
    const loadTeamMembersFromDatabase = async () => {
      if (!user?.id || initialDataLoaded) return;
      
      try {
        console.log("Attempting to load team members from database for user:", user.id);
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error loading team members:", error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Loaded team members from database:", data);
          // Transform from database format to TeamMember format
          const loadedMembers = data.map(member => ({
            name: member.name,
            profile: member.profile_description,
            employmentStatus: member.employment_status,
            triggerPoints: member.trigger_points || ''
          }));
          
          setTeamMembers(loadedMembers);
          setInitialDataLoaded(true);
        }
      } catch (error) {
        console.error("Error in loadTeamMembersFromDatabase:", error);
      }
    };
    
    loadTeamMembersFromDatabase();
  }, [user, initialDataLoaded]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { 
      name: '', 
      profile: '', 
      employmentStatus: '',
      triggerPoints: '' 
    }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const saveTeamMembers = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save team information");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Current user ID:", user.id);
      console.log("Team members to save:", JSON.stringify(teamMembers));
      
      // Delete existing team members for this user
      const { error: deleteError, count } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .select('count');
        
      if (deleteError) {
        console.error('Error deleting existing team members:', deleteError);
        throw deleteError;
      }
      
      console.log(`Deleted ${count} existing team members`);
      
      // Only insert members with non-empty names
      const membersToInsert = teamMembers.filter(member => member.name.trim() !== '');
      
      if (membersToInsert.length === 0) {
        console.log("No team members to insert");
        toast.success("Team information saved successfully!");
        setLoading(false);
        return;
      }
      
      console.log("Inserting team members:", JSON.stringify(membersToInsert));
      
      // Insert new team members one by one to handle potential errors individually
      for (const member of membersToInsert) {
        console.log("Inserting team member:", JSON.stringify(member));
        
        const { error, data } = await supabase
          .from('team_members')
          .insert({
            user_id: user.id,
            name: member.name,
            profile_description: member.profile,
            employment_status: member.employmentStatus,
            trigger_points: member.triggerPoints
          })
          .select();

        if (error) {
          console.error('Error inserting team member:', error);
          throw error;
        }
        
        console.log("Team member inserted successfully:", data);
      }

      toast.success("Team information saved successfully!");
    } catch (error: any) {
      console.error('Error saving team members:', error);
      toast.error(`Failed to save team information: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    teamMembers,
    loading,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    saveTeamMembers,
    serializeTeamMembers
  };
};
