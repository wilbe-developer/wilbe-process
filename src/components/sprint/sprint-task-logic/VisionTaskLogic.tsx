
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const VisionTaskLogic = ({ isCompleted, onComplete, task }: any) => {
  const [answered, setAnswered] = useState<boolean>(false);
  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <h2 className="text-lg font-semibold mb-4">
          Does the ultimate version of your company (5-10 years in the future) change the industry?
        </h2>
        <div className="flex gap-3 mb-4">
          <Button variant={answered ? "default" : "outline"} onClick={() => setAnswered(true)}>
            Yes
          </Button>
          <Button variant={!answered ? "default" : "outline"} onClick={() => setAnswered(false)}>
            No
          </Button>
        </div>
        {answered !== null && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Next steps:</h3>
              <p className="text-gray-700">
                Create a vivid description of your company's ultimate vision and the transformative impact it will have on the industry.
              </p>
            </div>
            <div className="mb-2 font-medium">Required upload:</div>
            <ul className="list-disc list-inside mb-2">
              <li>1-pager painting a picture of the ultimate version of your company and its impact</li>
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisionTaskLogic;
