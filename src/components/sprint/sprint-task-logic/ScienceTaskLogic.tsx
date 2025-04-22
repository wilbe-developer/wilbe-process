
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const ScienceTaskLogic = ({ isCompleted, onComplete, task }: any) => {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
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
        {answer === "Yes" && (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScienceTaskLogic;
