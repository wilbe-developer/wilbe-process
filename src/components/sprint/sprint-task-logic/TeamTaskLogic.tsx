
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamTaskState } from "@/hooks/useTeamTaskState";
import { useTeamStepBuilder } from "@/hooks/useTeamStepBuilder";
import { useTeamTaskSave } from "@/hooks/useTeamTaskSave";

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
  const { 
    teamMembers, 
    addTeamMember, 
    removeTeamMember, 
    updateTeamMember,
    saveTeamMembers, 
    loadTeamMembers
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

  const { saveTeamData } = useTeamTaskSave();

  // Effect to reload team members when team status changes
  useEffect(() => {
    if (teamStatus) {
      loadTeamMembers();
    }
  }, [teamStatus, loadTeamMembers]);

  const steps = useTeamStepBuilder({
    teamStatus,
    teamMembers,
    neededSkills,
    uploadedFileId,
    hiringPlanStep,
    onTeamMemberAdd: addTeamMember,
    onTeamMemberRemove: removeTeamMember,
    onTeamMemberUpdate: updateTeamMember,
    onSkillsChange: setNeededSkills,
    onFileUpload: setUploadedFileId,
    onHiringPlanStepChange: setHiringPlanStep
  });

  const handleComplete = async () => {
    // Always save team data to both tables
    const success = await saveTeamData(
      task.id,
      teamMembers,
      neededSkills,
      uploadedFileId
    );

    if (success) {
      onComplete(uploadedFileId);
    }
  };

  return (
    <div>
      {children}
      <Card className="mb-8">
        <CardContent className="p-6">
          <StepBasedTaskLogic
            steps={steps}
            isCompleted={isCompleted}
            onComplete={handleComplete}
            conditionalFlow={{}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamTaskLogic;
