
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
  hideMainQuestion, 
  children 
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  const teamStatus = sprintProfile?.team_status;
  
  // Define steps based on team status
  const buildSteps = (): Step[] => {
    if (teamStatus === "solo") {
      // Solo path
      return [
        {
          type: "content",
          content: [
            "As a solo founder, it's crucial to understand the importance of team culture and future team building.",
            "Watch the video below to learn about company culture and team building strategies."
          ]
        },
        {
          type: "content",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Company Culture & Team Building</h3>
              <VideoEmbed 
                youtubeEmbedId={TEAM_BUILDING_VIDEO_ID} 
                title="Company Culture and Team Building" 
              />
              <p className="text-sm text-gray-600 mt-2">
                Understanding how to build a strong team culture is essential, even as a solo founder planning for future growth.
              </p>
            </div>
          )
        },
        {
          type: "content",
          content: [
            "List the additional skills you'll need on your team to complement your own expertise."
          ]
        },
        {
          type: "content",
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skills Needed Analysis</h3>
              <Textarea 
                placeholder="Example: Technical co-founder with expertise in AI, Marketing professional with B2B SaaS experience, etc."
                rows={5}
                className="w-full"
              />
            </div>
          )
        },
        {
          type: "upload",
          action: "Download the hiring plan template, complete it, and upload your plan",
          uploads: ["Hiring plan based on template"]
        }
      ];
    } else if (teamStatus === "employees" || teamStatus === "cofounders") {
      const memberType = teamStatus === "employees" ? "team member" : "co-founder";
      
      return [
        {
          type: "content",
          content: [
            `Provide details about your ${memberType}s.`,
            `For each ${memberType}, include their name, a detailed profile explaining why they're crucial to your venture.`
          ]
        },
        {
          type: "content",
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{`Add ${memberType}s`}</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Name" />
                  <Input placeholder="Role" />
                </div>
                <Textarea 
                  placeholder={`Why is this ${memberType} essential to your venture? Describe their personal and professional strengths.`}
                  rows={4}
                />
              </div>
            </div>
          )
        },
        {
          type: "content",
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Full-time/Part-time status" />
                <Input placeholder="Trigger points for going full-time" />
              </div>
            </div>
          )
        }
      ];
    } else {
      // Default case if teamStatus is not set
      return [
        {
          type: "question",
          question: "Is this a solo project or do you have a team?",
          options: [
            { label: "I'm solo", value: "solo" },
            { label: "I have a team but they're employees", value: "employees" },
            { label: "I have co-founders", value: "cofounders" }
          ]
        }
      ];
    }
  };

  // Define conditional flow to handle navigation based on answers
  const conditionalFlow = {};

  return (
    <div>
      {children}
      <Card className="mb-8">
        <CardContent className="p-6">
          <StepBasedTaskLogic
            steps={buildSteps()}
            isCompleted={isCompleted}
            onComplete={(fileId) => {
              // Always pass the fileId to ensure it's captured
              onComplete(fileId);
            }}
            conditionalFlow={conditionalFlow}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamTaskLogic;
