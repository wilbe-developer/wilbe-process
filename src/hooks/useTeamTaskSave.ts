
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMember } from "./useTeamMembers";
import { Json } from "@/integrations/supabase/types";

interface TeamTaskAnswers {
  team_members: TeamMember[];
  needed_skills: string;
}

export const useTeamTaskSave = () => {
  const { user } = useAuth();

  const saveTeamData = async (
    taskId: string,
    teamMembers: TeamMember[],
    neededSkills: string,
    uploadedFileId?: string
  ) => {
    if (!user?.id) {
      toast.error("Missing required information");
      return false;
    }

    try {
      console.log("Starting to save team data...");
      
      const serializedTaskAnswers: Json = {
        team_members: teamMembers.map(member => ({
          name: member.name,
          profile: member.profile,
          employmentStatus: member.employmentStatus,
          triggerPoints: member.triggerPoints
        })),
        needed_skills: neededSkills
      };

      console.log("Saving task answers:", JSON.stringify(serializedTaskAnswers));

      // Save to user_sprint_progress
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_sprint_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }
      
      console.log("Existing progress:", existingProgress);
      
      if (existingProgress) {
        console.log("Updating existing progress...");
        const { error: updateError } = await supabase
          .from('user_sprint_progress')
          .update({
            completed: true,
            task_answers: serializedTaskAnswers,
            file_id: uploadedFileId,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new progress...");
        const { error: insertError } = await supabase
          .from('user_sprint_progress')
          .insert({
            user_id: user.id,
            task_id: taskId,
            completed: true,
            task_answers: serializedTaskAnswers,
            file_id: uploadedFileId,
            completed_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Also save team members to the team_members table
      // This is done regardless of solo/team status to ensure consistency
      console.log("Now saving team members to team_members table...");
      
      // Delete existing team members for this user
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Filter out empty team members
      const validTeamMembers = teamMembers.filter(member => member.name.trim() !== '');
      
      if (validTeamMembers.length > 0) {
        // Insert all valid team members
        for (const member of validTeamMembers) {
          const { error: insertMemberError } = await supabase
            .from('team_members')
            .insert({
              user_id: user.id,
              name: member.name,
              profile_description: member.profile,
              employment_status: member.employmentStatus,
              trigger_points: member.triggerPoints
            });
  
          if (insertMemberError) throw insertMemberError;
        }
      }

      console.log("Team data saved successfully!");
      toast.success("Data saved successfully");
      return true;
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`Failed to save data: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  return { saveTeamData };
};
