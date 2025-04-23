
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
      // Delete existing team members for this user
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Insert new team members
      for (const member of teamMembers) {
        if (!member.name.trim()) continue;
        
        const { error } = await supabase
          .from('team_members')
          .insert({
            user_id: user.id,
            name: member.name,
            profile_description: member.profile,
            employment_status: member.employmentStatus,
            trigger_points: member.triggerPoints
          });

        if (error) throw error;
      }

      toast.success("Team information saved successfully!");
    } catch (error) {
      console.error('Error saving team members:', error);
      toast.error("Failed to save team information");
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
