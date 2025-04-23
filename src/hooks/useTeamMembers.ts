
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

  useEffect(() => {
    if (taskAnswers?.team_members) {
      setTeamMembers(taskAnswers.team_members);
    }
  }, [taskAnswers]);

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
