
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
      return;
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

      const { data: existingProgress } = await supabase
        .from('user_sprint_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();
      
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
