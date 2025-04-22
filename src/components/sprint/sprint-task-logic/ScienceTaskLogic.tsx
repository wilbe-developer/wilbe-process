
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

interface ScienceTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
}

const ScienceTaskLogic: React.FC<ScienceTaskLogicProps> = ({ isCompleted, onComplete, task, hideMainQuestion, children }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  
  // Skip asking if hideMainQuestion is true (meaning we're showing value from profile)
  const showUploadSection = hideMainQuestion || answer === "Yes";
  
  return (
    <div>
      {children}
      <Card>
        <CardContent className="p-6 flex flex-col gap-6">
          {!hideMainQuestion && (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Did you come up with an invention or discovery that you're trying to commercialize?
              </h2>
              <div className="flex gap-3 mb-4">
                <Button
                  variant={answer === "Yes" ? "default" : "outline"}
                  onClick={() => setAnswer("Yes")}
                >
                  Yes
                </Button>
                <Button
                  variant={answer === "No" ? "default" : "outline"}
                  onClick={() => setAnswer("No")}
                >
                  No
                </Button>
              </div>
            </>
          )}
          
          {showUploadSection && (
            <div>
              <div className="mb-2 font-medium">Required uploads:</div>
              <ul className="list-disc list-inside mb-2">
                <li>Single page explaining the scientific intuition</li>
                <li>1-2 supporting scientific publications</li>
              </ul>
              <FileUploader
                isCompleted={isCompleted}
                onFileUploaded={() => onComplete()}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScienceTaskLogic;
