
import React from "react";
import { SprintProfileQuickEdit } from "./SprintProfileQuickEdit";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";

interface SprintProfileShowOrAskProps {
  profileKey: string;
  label?: string;
  options?: { value: string; label: string }[];
  type?: "string" | "boolean" | "select" | "multi-select";
  children: React.ReactNode;
}

// Helper to wrap a field with quick-edit if value is present
export const SprintProfileShowOrAsk = ({
  profileKey,
  label,
  options,
  type = "boolean",
  children,
}: SprintProfileShowOrAskProps) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  
  // Check if profile has this value set
  const hasProfileValue = sprintProfile && 
    profileKey in sprintProfile && 
    sprintProfile[profileKey] !== null && 
    sprintProfile[profileKey] !== undefined;
  
  if (hasProfileValue) {
    const value = sprintProfile[profileKey];
    
    // Format value for display
    let displayValue = value;
    if (typeof value === "boolean") {
      displayValue = value ? "Yes" : "No";
    } else if (type === "select" && options) {
      const option = options.find(opt => opt.value === value);
      displayValue = option ? option.label : value;
    }
    
    return (
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-medium">{label || profileKey}:</span>
          <span className="text-green-800">{displayValue}</span>
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
