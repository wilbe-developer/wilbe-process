
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
};

const VIDEO_PLACEHOLDER = (
  <div className="mb-6 bg-gray-100 p-4 rounded flex items-center">
    <span role="img" aria-label="video" className="mr-2">🎬</span>
    <div>
      <div className="font-medium">Deck Template Walkthrough (Audio)</div>
      <audio controls className="mt-2 w-full">
        <source src="/placeholder-audio.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
);

const DECK_TEMPLATE_PLACEHOLDER = (
  <div className="mb-6 bg-gray-100 p-4 rounded flex items-center">
    <span role="img" aria-label="deck" className="mr-2">💾</span>
    <div>
      <div className="font-medium">15-slide Deck Template</div>
      <Button 
        size="sm" 
        variant="outline" 
        className="ml-4"
        onClick={() => window.open("https://www.canva.com/design/template-id/view", "_blank")}
      >
        Open in Canva
      </Button>
    </div>
  </div>
);

const DeckTaskLogic: React.FC<Props> = ({ isCompleted, onComplete, hideMainQuestion, children }) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  const hasDeck = sprintProfile?.has_deck === true;
  
  // Define steps based on whether the user has a deck or not
  const buildSteps = (): Step[] => {
    if (!hasDeck) {
      // If they don't have a deck, show guidance and upload steps
      return [
        {
          type: "content",
          content: [
            "We'll help you create a compelling pitch deck using our proven template",
            "Listen to the audio guide for detailed explanations of each slide",
            "Download and customize the template in Canva",
            "Upload your completed deck when ready"
          ]
        },
        {
          type: "upload",
          action: "Upload your completed pitch deck",
          uploads: ["15-slide deck based on template"]
        }
      ];
    } else {
      // If they have a deck, ask if it fits the template
      return [
        {
          type: "question",
          question: "Does your deck fit the 15-slide template?",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
          ]
        },
        {
          type: "upload",
          action: "Upload your existing pitch deck",
          uploads: ["15-slide deck"]
        },
        {
          type: "content",
          content: [
            "We recommend using our proven 15-slide template",
            "Listen to the audio guide for detailed explanations of each slide",
            "Download and customize the template in Canva",
            "Upload your completed deck when ready"
          ]
        },
        {
          type: "upload",
          action: "Upload your modified pitch deck",
          uploads: ["15-slide deck based on template"]
        }
      ];
    }
  };

  // Define conditional flow to skip content or upload steps based on answer
  const conditionalFlow = hasDeck ? {
    0: { // If on the "Does your deck fit template" question
      "yes": 1, // If "Yes" - go to the upload step for existing deck
      "no": 2   // If "No" - go to the content step with instructions
    }
  } : {};

  return (
    <div>
      {children}
      <Card className="mb-8">
        <CardContent className="p-6">
          {VIDEO_PLACEHOLDER}
          {DECK_TEMPLATE_PLACEHOLDER}
          
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

export default DeckTaskLogic;
