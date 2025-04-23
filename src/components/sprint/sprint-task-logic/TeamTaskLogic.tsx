
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import TeamMemberForm from "../step-types/TeamMemberForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
};

const TEAM_BUILDING_VIDEO_ID = "j5TEYCrLDYo";

const TeamTaskLogic: React.FC<Props> = ({ 
  isCompleted, 
  onComplete, 
  task,
  hideMainQuestion, 
  children 
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  const { user } = useAuth();
  const teamStatus = sprintProfile?.team_status;
  const [neededSkills, setNeededSkills] = useState('');
  const { teamMembers, loading, addTeamMember, removeTeamMember, updateTeamMember, saveTeamMembers } = useTeamMembers(task?.progress?.task_answers);

  const saveTeamData = async () => {
    if (!user?.id || !task?.id) {
      toast.error("Missing required information");
      return;
    }

    try {
      // Save team members
      if (teamStatus !== "solo") {
        await saveTeamMembers();
      }

      // Save task progress
      const taskAnswers = {
        team_members: teamMembers,
        needed_skills: neededSkills
      };

      const { error: progressError } = await supabase
        .from('user_sprint_progress')
        .upsert({
          user_id: user.id,
          task_id: task.id,
          completed: true,
          task_answers: taskAnswers,
          completed_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      onComplete();
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error("Failed to save data");
    }
  };

  const buildSteps = (): Step[] => {
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
            <div key="video" className="space-y-6">
              <VideoEmbed 
                youtubeEmbedId={TEAM_BUILDING_VIDEO_ID} 
                title="Company Culture and Team Building" 
              />
              <p className="text-sm text-gray-600 mt-2">
                Understanding how to build a strong team culture is essential, even as a solo founder planning for future growth.
              </p>
            </div>
          ]
        },
        {
          type: "content",
          content: [
            "What additional skills will you need on your team to complement your own expertise?",
            <div key="skills" className="space-y-4">
              <Textarea 
                value={neededSkills}
                onChange={(e) => setNeededSkills(e.target.value)}
                placeholder="Example: Technical co-founder with expertise in AI, Marketing professional with B2B SaaS experience, etc."
                rows={5}
                className="w-full"
              />
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Hiring Template</h4>
                <p className="text-sm text-gray-700">
                  When you're ready to expand your team, consider creating a clear job description that includes:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
                  <li>Role and responsibilities</li>
                  <li>Required skills and experience</li>
                  <li>Cultural fit indicators</li>
                  <li>Growth opportunities</li>
                  <li>Compensation structure</li>
                </ul>
              </div>
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
