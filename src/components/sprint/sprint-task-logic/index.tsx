
import React from "react";
import DeckTaskLogic from "./DeckTaskLogic";
import TeamTaskLogic from "./TeamTaskLogic";
import ScienceTaskLogic from "./ScienceTaskLogic";
import IpTaskLogic from "./IpTaskLogic";
import ProblemTaskLogic from "./ProblemTaskLogic";
import CustomerTaskLogic from "./CustomerTaskLogic";
import MarketTaskLogic from "./MarketTaskLogic";
import FundingTaskLogic from "./FundingTaskLogic";
import ExperimentTaskLogic from "./ExperimentTaskLogic";
import VisionTaskLogic from "./VisionTaskLogic";
import { SprintProfileQuickEdit } from "../SprintProfileQuickEdit";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";

// Helper to wrap a field with quick-edit if value is present
const SprintProfileShowOrAsk = ({
  profileKey,
  label,
  children,
}: {
  profileKey: string;
  label: string;
  children: React.ReactNode;
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  if (sprintProfile && profileKey in sprintProfile && sprintProfile[profileKey] !== null && sprintProfile[profileKey] !== undefined) {
    return (
      <div className="mb-6 flex items-center gap-2">
        <span className="font-medium">{label || profileKey}:</span>
        <span className="text-green-800">
          {typeof sprintProfile[profileKey] === "boolean"
            ? sprintProfile[profileKey] ? "Yes" : "No"
            : sprintProfile[profileKey]}
        </span>
        <SprintProfileQuickEdit
          profileKey={profileKey}
          label={label}
          type={typeof sprintProfile[profileKey] === "boolean" ? "boolean" : "string"}
          description="You may change your answer here if needed."
        />
      </div>
    );
  }
  return <>{children}</>;
};

export const SprintTaskLogicRouter = ({
  task,
  isCompleted,
  onComplete
}: {
  task: any;
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
}) => {
  // Main router for each logic task
  switch (task.title) {
    case "Create Your Pitch Deck":
      return (
        <DeckTaskLogic
          isCompleted={isCompleted}
          onComplete={onComplete}
          task={task}
          hideMainQuestion={true} // Skip main q, show quick edit
        >
          <SprintProfileShowOrAsk profileKey="has_deck" label="Do you have a deck?">
            {/* This is now a valid child */}
            <div>Loading deck question...</div>
          </SprintProfileShowOrAsk>
        </DeckTaskLogic>
      );
    case "Develop Team Building Plan":
    case "Team Profile":
      return (
        <SprintProfileShowOrAsk profileKey="team_status" label="Team status">
          <TeamTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Scientific Foundation":
      return (
        <SprintProfileShowOrAsk profileKey="commercializing_invention" label="Did you come up with an invention?">
          <ScienceTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "IP Strategy":
      return (
        <SprintProfileShowOrAsk profileKey="university_ip" label="Is your company reliant on a university invention?">
          <IpTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Problem Definition":
      return (
        <SprintProfileShowOrAsk profileKey="problem_defined" label="Identified a problem to solve?">
          <ProblemTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Customer Insights":
    case "Customer Discovery":
      return (
        <SprintProfileShowOrAsk profileKey="customer_engagement" label="Spoken to customers?">
          <CustomerTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Market Validation":
    case "Market Analysis":
      return (
        <SprintProfileShowOrAsk profileKey="market_known" label="Do you know your target market?">
          <MarketTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Financial Strategy":
      return (
        <SprintProfileShowOrAsk profileKey="has_financial_plan" label="Do you have a financial plan?">
          <FundingTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Milestone Planning":
      return (
        <SprintProfileShowOrAsk profileKey="experiment_validated" label="Have you run an experiment to validate your idea?">
          <ExperimentTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    case "Vision Document":
      return (
        <SprintProfileShowOrAsk profileKey="industry_changing_vision" label="Will your company change the industry?">
          <VisionTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        </SprintProfileShowOrAsk>
      );
    default:
      return null;
  }
};
