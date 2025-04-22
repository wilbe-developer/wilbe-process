
import React from "react";
import DeckTaskLogic from "./DeckTaskLogic";

type SprintLogicRouterProps = {
  task: any;
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
};

// Map task title or category to custom logic component
export const SprintTaskLogicRouter: React.FC<SprintLogicRouterProps> = ({
  task,
  isCompleted,
  onComplete
}) => {
  // NOTE: This matching logic can be expanded as we build out other task logic
  if (
    task.title &&
    (task.title.toLowerCase().includes("deck") ||
     task.title.toLowerCase().includes("storytelling"))
  ) {
    return (
      <DeckTaskLogic isCompleted={isCompleted} onComplete={onComplete} task={task} />
    );
  }

  // Placeholder for other custom logic components (to be expanded)
  // e.g. if (task.title === "Business Model") return <BusinessLogic ... />

  return null; // Defaults to the standard logic in SprintTaskPage
};
