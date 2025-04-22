
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const TEAM_OPTIONS = [
  {
    label: "I’m solo",
    content: "Importance of team and culture",
    requiredUploads: [
      "List of additional needed skills",
      "Hiring plan (use template)"
    ]
  },
  {
    label: "I have a team but they’re employees",
    requiredUploads: [
      "Profile of each team member",
      "Their role + full/part-time status + trigger points for going full-time"
    ]
  },
  {
    label: "I have co-founders",
    requiredUploads: [
      "Profile of each co-founder",
      "Their role + full/part-time status + trigger points for going full-time"
    ]
  }
];

const TeamTaskLogic = ({ task, isCompleted, onComplete }: any) => {
  const [selected, setSelected] = useState<string | null>(null);

  const option = TEAM_OPTIONS.find(o => o.label === selected);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <h2 className="text-lg font-semibold mb-4">
          Is this a solo project or do you have a team?
        </h2>
        <div className="flex gap-3 mb-4">
          {TEAM_OPTIONS.map(opt => (
            <Button
              key={opt.label}
              variant={selected === opt.label ? "default" : "outline"}
              onClick={() => setSelected(opt.label)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {option?.content && (
          <div className="mb-3 text-gray-700 font-medium">{option.content}</div>
        )}
        {option?.requiredUploads && (
          <div>
            <div className="mb-3 font-medium">Required uploads:</div>
            <ul className="list-disc list-inside text-gray-700 mb-2">
              {option.requiredUploads.map(u => (
                <li key={u}>{u}</li>
              ))}
            </ul>
            <FileUploader
              isCompleted={isCompleted}
              onFileUploaded={() => onComplete()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamTaskLogic;
