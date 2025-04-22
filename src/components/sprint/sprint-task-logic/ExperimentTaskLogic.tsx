
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

interface ExperimentTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
}

const ExperimentTaskLogic: React.FC<ExperimentTaskLogicProps> = ({ isCompleted, onComplete, task, hideMainQuestion, children }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  
  // Skip asking if hideMainQuestion is true (meaning we're showing value from profile)
  const showUploadSection = hideMainQuestion || answer !== null;
  
  return (
    <div>
      {children}
      <Card>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="mb-3 text-gray-700 font-medium">
            Importance of an iterative mindset.
          </div>
          
          {!hideMainQuestion && (
            <>
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
            </>
          )}
          
          {showUploadSection && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Why this matters:</h3>
                <p className="text-gray-700">
                  Successful startups operate with an experimental mindset, continuously testing and validating assumptions about their product, market, and business model.
                </p>
              </div>
              
              <div className="mb-2 font-medium">Required upload:</div>
              <ul className="list-disc list-inside mb-2">
                <li>Upload milestone plan (technical + commercial, based on template)</li>
              </ul>
              
              <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExperimentTaskLogic;
