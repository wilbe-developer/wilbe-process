
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import TeamMemberForm from "../step-types/TeamMemberForm";
import { useTeamTaskState } from "@/hooks/useTeamTaskState";
import SoloFounderHiringSteps from "../step-types/SoloFounderHiringSteps";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TeamTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
}

const TeamTaskLogic: React.FC<TeamTaskLogicProps> = ({ 
  isCompleted, 
  onComplete, 
  task,
  hideMainQuestion, 
  children 
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  const { user } = useAuth();
  const { 
    teamMembers, 
    loading, 
    addTeamMember, 
    removeTeamMember, 
    updateTeamMember, 
    saveTeamMembers 
  } = useTeamMembers(task?.progress?.task_answers);

  const {
    neededSkills,
    setNeededSkills,
    uploadedFileId,
    setUploadedFileId,
    hiringPlanStep,
    setHiringPlanStep,
    teamStatus
  } = useTeamTaskState(task, sprintProfile);

  const saveTeamData = async () => {
    if (!user?.id || !task?.id) {
      toast.error("Missing required information");
      return;
    }

    try {
      console.log("Starting to save team data...");
      
      if (teamStatus !== "solo") {
        console.log("Saving team members...");
        await saveTeamMembers();
      }

      const serializedTaskAnswers = {
        team_members: teamMembers,
        needed_skills: neededSkills
      };

      console.log("Saving task answers:", JSON.stringify(serializedTaskAnswers));

      const { data: existingProgress } = await supabase
        .from('user_sprint_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', task.id)
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
            task_id: task.id,
            completed: true,
            task_answers: serializedTaskAnswers,
            file_id: uploadedFileId,
            completed_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      console.log("Team data saved successfully!");
      onComplete(uploadedFileId);
      toast.success("Data saved successfully");
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`Failed to save data: ${error.message || 'Unknown error'}`);
    }
  };

  const buildSteps = () => {
    if (teamStatus === "solo") {
      return [
        {
          type: "content",
          content: "As a solo founder, it's crucial to understand the importance of team culture and future team building."
        },
        {
          type: "content",
          content: [
            "Company Culture & Team Building",
            <SoloFounderHiringSteps
              key="hiring-steps"
              neededSkills={neededSkills}
              onSkillsChange={setNeededSkills}
              uploadedFileId={uploadedFileId}
              onFileUpload={setUploadedFileId}
              hiringPlanStep={hiringPlanStep}
              onHiringPlanStepChange={setHiringPlanStep}
            />
          ]
        }
      ];
    } else {
      const memberType = teamStatus === "employees" ? "team member" : "co-founder";
      
      return [
        {
          type: "content",
          content: [
            `Tell us about your ${memberType}s`,
            <TeamMemberForm
              key="team-members"
              teamMembers={teamMembers}
              memberType={memberType}
              onAdd={addTeamMember}
              onRemove={removeTeamMember}
              onUpdate={updateTeamMember}
            />
          ]
        }
      ];
    }
  };

  return (
    <div>
      {children}
      <Card className="mb-8">
        <CardContent className="p-6">
          <StepBasedTaskLogic
            steps={buildSteps()}
            isCompleted={false}
            onComplete={saveTeamData}
            conditionalFlow={{}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamTaskLogic;
