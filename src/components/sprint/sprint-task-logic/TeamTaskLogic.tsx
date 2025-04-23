
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
};

const COMPANY_CULTURE_VIDEO_ID = "dQw4w9WgXcQ"; // Placeholder - replace with actual video ID

// Template resources
const HIRING_PLAN_TEMPLATE = {
  name: "Hiring Plan Template",
  url: "#" // Placeholder URL for the template
};

const TeamTaskLogic: React.FC<Props> = ({ isCompleted, onComplete, hideMainQuestion, children }) => {
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
            "As a solo founder, it's crucial to understand the importance of team culture even before building your team.",
            "Watch the video below to learn about company culture and team building strategies.",
            "Then, create a list of skills you need and develop a hiring plan using our template."
          ]
        },
        {
          type: "content",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Company Culture & Team Building</h3>
              <VideoEmbed 
                youtubeEmbedId={COMPANY_CULTURE_VIDEO_ID} 
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
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skills Needed Analysis</h3>
              <p>List the additional skills you'll need on your team to complement your own:</p>
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
      // Team members or co-founders path
      const title = teamStatus === "employees" ? "Team Members" : "Co-founders";
      const memberType = teamStatus === "employees" ? "team member" : "co-founder";
      
      return [
        {
          type: "content",
          content: [
            `Please provide details about your ${title.toLowerCase()}.`,
            `For each ${memberType}, include their name, expertise, and why they're the best fit for your venture.`,
            `Then specify their current commitment level and conditions for increasing their involvement.`
          ]
        },
        {
          type: "upload",
          action: `Upload profiles of your ${title.toLowerCase()}`,
          uploads: [
            `Profile of each ${memberType}`,
            `Their role + full/part-time status + trigger points for going full-time`
          ]
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
        },
        {
          type: "content",
          content: "Please select an option above to continue."
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Team Structure</h2>
            </div>
            {teamStatus === "solo" && (
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href={HIRING_PLAN_TEMPLATE.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
                >
                  <span className="mr-2">📄</span>
                  Download Hiring Plan Template
                </a>
              </div>
            )}
          </div>
          
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
