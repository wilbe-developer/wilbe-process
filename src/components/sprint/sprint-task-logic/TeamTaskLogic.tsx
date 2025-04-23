
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";
import { useTeamMembers, serializeTeamMembers } from "@/hooks/useTeamMembers";
import TeamMemberForm from "../step-types/TeamMemberForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import FileUploader from "@/components/sprint/FileUploader";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
};

const TEAM_BUILDING_VIDEO_ID = "j5TEYCrLDYo";
const HIRING_TEMPLATE_PLACEHOLDER = "/hiring-template-placeholder.pdf"; // Placeholder path

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
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();
  const [hiringPlanStep, setHiringPlanStep] = useState<'download' | 'upload'>('download');
  
  const { teamMembers, loading, addTeamMember, removeTeamMember, updateTeamMember, saveTeamMembers } = useTeamMembers(task?.progress?.task_answers);

  // Load needed skills from task answers if available
  useEffect(() => {
    if (task?.progress?.task_answers?.needed_skills) {
      setNeededSkills(task.progress.task_answers.needed_skills);
    }
  }, [task?.progress?.task_answers]);

  // Load uploaded file ID if available
  useEffect(() => {
    if (task?.progress?.file_id) {
      setUploadedFileId(task.progress.file_id);
    }
  }, [task?.progress?.file_id]);

  const saveTeamData = async () => {
    if (!user?.id || !task?.id) {
      toast.error("Missing required information");
      return;
    }

    try {
      console.log("Starting to save team data...");
      
      // Save team members
      if (teamStatus !== "solo") {
        console.log("Saving team members...");
        await saveTeamMembers();
      }

      // Create a properly serialized task_answers object
      // Convert team members to a JSON-serializable format
      const serializedTaskAnswers = {
        team_members: serializeTeamMembers(teamMembers),
        needed_skills: neededSkills
      } as Json;

      console.log("Saving task answers:", JSON.stringify(serializedTaskAnswers));

      // Check if there's an existing progress entry
      const { data: existingProgress } = await supabase
        .from('user_sprint_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', task.id)
        .single();
      
      console.log("Existing progress:", existingProgress);
      
      if (existingProgress) {
        // Update existing progress
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

        if (updateError) {
          console.error("Error updating progress:", updateError);
          throw updateError;
        }
      } else {
        // Insert new progress
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

        if (insertError) {
          console.error("Error inserting progress:", insertError);
          throw insertError;
        }
      }

      console.log("Team data saved successfully!");
      onComplete(uploadedFileId);
      toast.success("Data saved successfully");
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`Failed to save data: ${error.message || 'Unknown error'}`);
    }
  };

  const handleFileUpload = (fileId: string) => {
    console.log("File uploaded, ID:", fileId);
    setUploadedFileId(fileId);
    toast.success("Hiring plan uploaded successfully!");
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
            </div>
          ]
        },
        {
          type: "content",
          content: [
            "Hiring Plan Template",
            <div key="hiring-plan" className="space-y-4">
              {hiringPlanStep === 'download' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Download our hiring plan template to help you structure your future team building efforts.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => {
                        // Download template logic
                        window.open(HIRING_TEMPLATE_PLACEHOLDER, '_blank');
                        setHiringPlanStep('upload');
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Hiring Template
                    </Button>
                  </div>
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
                      onFileUploaded={handleFileUpload}
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
