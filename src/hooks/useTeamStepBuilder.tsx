
import React from "react";
import { Step } from "@/components/sprint/StepBasedTaskLogic";
import TeamMemberForm from "@/components/sprint/step-types/TeamMemberForm";
import { TeamMember } from "./useTeamMembers";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import FileUploader from "@/components/sprint/FileUploader";

const TEAM_BUILDING_VIDEO_ID = "j5TEYCrLDYo";
const HIRING_TEMPLATE_PLACEHOLDER = "/hiring-template-placeholder.pdf";

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
    // Split the solo founder steps into three sequential steps
    return [
      {
        type: "content",
        content: [
          "As a solo founder, it's crucial to understand the importance of team culture and future team building.",
          <VideoEmbed 
            key="video"
            youtubeEmbedId={TEAM_BUILDING_VIDEO_ID} 
            title="Company Culture and Team Building" 
          />
        ]
      },
      {
        type: "content",
        content: [
          "What technical skills do you need in your future team?",
          <div key="skills-input" className="mt-4">
            <Textarea 
              value={neededSkills}
              onChange={(e) => onSkillsChange(e.target.value)}
              placeholder="Example: Technical co-founder with expertise in AI, Marketing professional with B2B SaaS experience, etc."
              rows={5}
              className="w-full"
            />
          </div>
        ]
      },
      {
        type: "content",
        content: [
          hiringPlanStep === 'download' ? "Download our hiring plan template" : "Upload your completed hiring plan",
          <div key="hiring-plan" className="mt-4">
            {hiringPlanStep === 'download' ? (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-gray-700">
                  Download our hiring plan template to help you structure your future team building efforts.
                </p>
                <Button 
                  onClick={() => {
                    window.open(HIRING_TEMPLATE_PLACEHOLDER, '_blank');
                    onHiringPlanStepChange('upload');
                  }}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Hiring Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Please upload your completed hiring plan:
                </p>
                {uploadedFileId ? (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                    <p className="text-green-700 flex items-center gap-2">
                      <Upload size={16} />
                      Hiring plan uploaded successfully!
                    </p>
                  </div>
                ) : (
                  <FileUploader
                    onFileUploaded={onFileUpload}
                    isCompleted={false}
                  />
                )}
              </div>
            )}
          </div>
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
