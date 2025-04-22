
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
  options,
  type = "boolean",
  children,
}: {
  profileKey: string;
  label: string;
  options?: { value: string; label: string }[];
  type?: "string" | "boolean" | "select" | "multi-select";
  children: React.ReactNode;
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  if (sprintProfile && profileKey in sprintProfile && sprintProfile[profileKey] !== null && sprintProfile[profileKey] !== undefined) {
    return (
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-medium">{label || profileKey}:</span>
          <span className="text-green-800">
            {typeof sprintProfile[profileKey] === "boolean"
              ? sprintProfile[profileKey] ? "Yes" : "No"
              : sprintProfile[profileKey]}
          </span>
          <SprintProfileQuickEdit
            profileKey={profileKey}
            label={label}
            type={type}
            options={options}
            description="You may change your answer here if needed."
          />
        </div>
        <div className="ml-6 border-l-2 border-slate-300 pl-4">
          {children}
        </div>
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
        <SprintProfileShowOrAsk 
          profileKey="has_deck" 
          label="Do you have a deck?"
          type="boolean"
        >
          <DeckTaskLogic
            isCompleted={isCompleted}
            onComplete={onComplete}
            task={task}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Develop Team Building Plan":
    case "Team Profile":
      return (
        <SprintProfileShowOrAsk 
          profileKey="team_status" 
          label="Team status"
          type="select"
          options={[
            { value: "solo", label: "I'm solo" },
            { value: "employees", label: "I have a team but they're employees" },
            { value: "cofounders", label: "I have co-founders" }
          ]}
        >
          <TeamTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Scientific Foundation":
      return (
        <SprintProfileShowOrAsk 
          profileKey="commercializing_invention" 
          label="Did you come up with an invention?"
          type="boolean"
        >
          <ScienceTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "IP Strategy":
      return (
        <SprintProfileShowOrAsk 
          profileKey="university_ip" 
          label="Is your company reliant on a university invention?"
          type="boolean"
        >
          <IpTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Problem Definition":
      return (
        <SprintProfileShowOrAsk 
          profileKey="problem_defined" 
          label="Identified a problem to solve?"
          type="boolean"
        >
          <ProblemTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Customer Insights":
    case "Customer Discovery":
      return (
        <SprintProfileShowOrAsk 
          profileKey="customer_engagement" 
          label="Spoken to customers?"
          type="select"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "early", label: "It's too early" }
          ]}
        >
          <CustomerTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Market Validation":
    case "Market Analysis":
      return (
        <SprintProfileShowOrAsk 
          profileKey="market_known" 
          label="Do you know your target market?"
          type="boolean"
        >
          <MarketTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Financial Strategy":
      return (
        <SprintProfileShowOrAsk 
          profileKey="has_financial_plan" 
          label="Do you have a financial plan?"
          type="boolean"
        >
          <FundingTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Milestone Planning":
      return (
        <SprintProfileShowOrAsk 
          profileKey="experiment_validated" 
          label="Have you run an experiment to validate your idea?"
          type="boolean"
        >
          <ExperimentTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    case "Vision Document":
      return (
        <SprintProfileShowOrAsk 
          profileKey="industry_changing_vision" 
          label="Will your company change the industry?"
          type="boolean"
        >
          <VisionTaskLogic
            task={task}
            isCompleted={isCompleted}
            onComplete={onComplete}
            hideMainQuestion={true}
          />
        </SprintProfileShowOrAsk>
      );
    default:
      return null;
  }
};
