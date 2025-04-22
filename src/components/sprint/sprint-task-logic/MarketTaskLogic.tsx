
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const MarketTaskLogic = ({ isCompleted, onComplete, task }: any) => {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="mb-3 text-gray-700 font-medium">
          What a good market analysis looks like and why it matters
        </div>
        <h2 className="text-lg font-semibold mb-4">
          Do you know what market you expect to capture and why hasn’t anyone else done this yet?
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
            <div className="mb-2 font-medium">Required uploads:</div>
            <ul className="list-disc list-inside mb-2">
              <li>1-pager on competition analysis</li>
              <li>1-pager on market size and capture expectations</li>
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketTaskLogic;
