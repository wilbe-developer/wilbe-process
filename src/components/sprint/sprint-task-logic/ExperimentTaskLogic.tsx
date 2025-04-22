
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const ExperimentTaskLogic = ({ isCompleted, onComplete }: any) => {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="mb-3 text-gray-700 font-medium">
          Importance of an iterative mindset.
        </div>
        <h2 className="text-lg font-semibold mb-4">
          Have you recently run an experiment to validate your idea?
        </h2>
        <div className="flex gap-3 mb-4">
          <Button variant={answer === "Yes" ? "default" : "outline"} onClick={() => setAnswer("Yes")}>
            Yes
          </Button>
          <Button variant={answer === "No" ? "default" : "outline"} onClick={() => setAnswer("No")}>
            No
          </Button>
        </div>
        {(answer === "Yes" || answer === "No") && (
          <div>
            <div className="mb-2 font-medium">Required upload:</div>
            <ul className="list-disc list-inside mb-2">
              <li>Upload milestone plan (technical + commercial, based on template)</li>
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperimentTaskLogic;
