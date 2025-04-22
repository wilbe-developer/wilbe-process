
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const FundingTaskLogic = ({ isCompleted, onComplete }: any) => {
  const [plan, setPlan] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="mb-3 text-gray-700 font-medium">
          Different types of money, what is the point of VC, and funding fundamentals.
        </div>
        <h2 className="text-lg font-semibold mb-1">
          How much funding do you think you need? Where from?
        </h2>
        <div className="mb-2 font-medium">Do you know how much?</div>
        <div className="flex gap-3 mb-4">
          <Button variant={plan === "I have a financial plan" ? "default" : "outline"} onClick={() => setPlan("I have a financial plan")}>
            I have a financial plan
          </Button>
          <Button variant={plan === "I don’t know how much" ? "default" : "outline"} onClick={() => setPlan("I don’t know how much")}>
            I don’t know how much
          </Button>
        </div>
        <div className="mb-2 font-medium">What is your expected funding source?</div>
        <div className="flex gap-3 mb-4">
          {["Grants", "VCs", "Bootstrap/Other", "Don’t know yet"].map(option => (
            <Button key={option} variant={source === option ? "default" : "outline"} onClick={() => setSource(option)}>
              {option}
            </Button>
          ))}
        </div>
        {(plan || source) && (
          <div>
            <div className="mb-2 font-medium">Required upload:</div>
            <ul className="list-disc list-inside mb-2">
              <li>Financial plan (based on template)</li>
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FundingTaskLogic;
