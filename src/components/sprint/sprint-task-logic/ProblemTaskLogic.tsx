
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const ProblemTaskLogic = ({ isCompleted, onComplete }: any) => {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="mb-3 text-gray-700 font-medium">
          Difference between your invention and the problem to solve
        </div>
        <h2 className="text-lg font-semibold mb-4">
          Have you identified a problem to solve that is beyond your invention?
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
          <div>
            <div className="mb-2">Required upload:</div>
            <ul className="list-disc list-inside mb-2">
              <li>One-pager explaining the problem and solution</li>
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
        {answer === "No" && (
          <div>
            <div className="mb-2">Please explain your challenge below.</div>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProblemTaskLogic;
