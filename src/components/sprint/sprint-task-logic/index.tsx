import React from "react";
import DeckTaskLogic from "./DeckTaskLogic";
import { SprintProfileQuickEdit } from "../SprintProfileQuickEdit";

type SprintLogicRouterProps = {
  task: any;
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
};

const TASK_PROFILE_FIELD: Record<string, { field: string, label: string, options?: { value: string; label: string }[], type?: "string" | "boolean" }> = {
  "Create Your Pitch Deck": {
    field: "has_deck",
    label: "Do you have a deck?",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ],
    type: "boolean"
  },
  "Develop Team Building Plan": {
    field: "team_status",
    label: "Team status",
    options: [
      { value: "solo", label: "I’m solo" },
      { value: "employee", label: "I have a team but they’re employees" },
      { value: "cofounder", label: "I have co-founders" }
    ]
  },
  "Team Profile": {
    field: "team_status",
    label: "Team status",
    options: [
      { value: "solo", label: "I’m solo" },
      { value: "employee", label: "I have a team but they’re employees" },
      { value: "cofounder", label: "I have co-founders" }
    ]
  },
  "Scientific Foundation": {
    field: "commercializing_invention",
    label: "Did you come up with an invention?",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  },
  "IP Strategy": {
    field: "university_ip",
    label: "Is your company reliant on a university invention?",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ],
    type: "boolean"
  }
};

export const SprintTaskLogicRouter: React.FC<SprintLogicRouterProps> = ({
  task,
  isCompleted,
  onComplete
}) => {
  const profileFieldInfo = TASK_PROFILE_FIELD[task.title];

  if (
    task.title &&
    (task.title.toLowerCase().includes("deck") ||
     task.title.toLowerCase().includes("storytelling"))
  ) {
    return (
      <div>
        {profileFieldInfo && (
          <div className="mb-6">
            <SprintProfileQuickEdit
              profileKey={profileFieldInfo.field}
              label={profileFieldInfo.label}
              type={profileFieldInfo.type}
              options={profileFieldInfo.options}
              description="This was answered in your onboarding. You may change your answer here."
            />
          </div>
        )}
        <DeckTaskLogic
          isCompleted={isCompleted}
          onComplete={onComplete}
          task={task}
          hideMainQuestion={!!profileFieldInfo}
        />
      </div>
    );
  }

  return null; // Defaults to standard logic
};
