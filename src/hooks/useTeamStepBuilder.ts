
import { Step } from "@/components/sprint/StepBasedTaskLogic";
import SoloFounderHiringSteps from "@/components/sprint/step-types/SoloFounderHiringSteps";
import TeamMemberForm from "@/components/sprint/step-types/TeamMemberForm";
import { TeamMember } from "./useTeamMembers";

interface UseTeamStepBuilderProps {
  teamStatus: string | undefined;
  teamMembers: TeamMember[];
  neededSkills: string;
  uploadedFileId?: string;
  hiringPlanStep: 'download' | 'upload';
  onTeamMemberAdd: () => void;
  onTeamMemberRemove: (index: number) => void;
  onTeamMemberUpdate: (index: number, field: keyof TeamMember, value: string) => void;
  onSkillsChange: (skills: string) => void;
  onFileUpload: (fileId: string) => void;
  onHiringPlanStepChange: (step: 'download' | 'upload') => void;
}

export const useTeamStepBuilder = ({
  teamStatus,
  teamMembers,
  neededSkills,
  uploadedFileId,
  hiringPlanStep,
  onTeamMemberAdd,
  onTeamMemberRemove,
  onTeamMemberUpdate,
  onSkillsChange,
  onFileUpload,
  onHiringPlanStepChange
}: UseTeamStepBuilderProps): Step[] => {
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
            onSkillsChange={onSkillsChange}
            uploadedFileId={uploadedFileId}
            onFileUpload={onFileUpload}
            hiringPlanStep={hiringPlanStep}
            onHiringPlanStepChange={onHiringPlanStepChange}
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
            onAdd={onTeamMemberAdd}
            onRemove={onTeamMemberRemove}
            onUpdate={onTeamMemberUpdate}
          />
        ]
      }
    ];
  }
};
