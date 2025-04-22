
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const IpTaskLogic = ({ isCompleted, onComplete, task }: any) => {
  // Step-through for full IP followup branching logic
  const [universityIp, setUniversityIp] = useState<string | null>(null);
  const [tto, setTto] = useState<string | null>(null);
  const [ownIp, setOwnIp] = useState<string | null>(null);
  const [patents, setPatents] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="mb-3 text-gray-700 font-medium">
          IP is not the most important asset — it's the people and their knowledge.
        </div>
        <h2 className="text-lg font-semibold mb-4">
          Is your company reliant on something you’ve invented / created at a university?
        </h2>
        <div className="flex gap-3 mb-4">
          <Button onClick={() => setUniversityIp("Yes")} variant={universityIp === "Yes" ? "default" : "outline"}>
            Yes
          </Button>
          <Button onClick={() => setUniversityIp("No")} variant={universityIp === "No" ? "default" : "outline"}>
            No
          </Button>
        </div>

        {/* University: TTO route */}
        {universityIp === "Yes" && (
          <>
            <div className="mb-2 font-medium">Have you begun conversations with the tech transfer office?</div>
            <div className="flex gap-3 mb-3">
              <Button onClick={() => setTto("Yes")} variant={tto === "Yes" ? "default" : "outline"}>
                Yes
              </Button>
              <Button onClick={() => setTto("No")} variant={tto === "No" ? "default" : "outline"}>
                No
              </Button>
            </div>
            {tto === "Yes" && (
              <div>
                <div className="mb-2">Required uploads:</div>
                <ul className="list-disc list-inside mb-2">
                  <li>Summary of conversation</li>
                  <li>Equity % to be given to TTO</li>
                </ul>
                <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
              </div>
            )}
            {tto === "No" && (
              <div>
                <div className="mb-2">Please explain your current plans with TTO below.</div>
                <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
              </div>
            )}
          </>
        )}

        {/* Not university: do you own all IP? */}
        {universityIp === "No" && (
          <>
            <div className="mb-2 font-medium">Do you own all the IP?</div>
            <div className="flex gap-3 mb-3">
              <Button onClick={() => setOwnIp("Yes")} variant={ownIp === "Yes" ? "default" : "outline"}>
                Yes
              </Button>
              <Button onClick={() => setOwnIp("No")} variant={ownIp === "No" ? "default" : "outline"}>
                No
              </Button>
            </div>
            {ownIp === "Yes" && (
              <>
                <div className="mb-2">Have patents been filed?</div>
                <div className="flex gap-3 mb-3">
                  <Button onClick={() => setPatents("Yes")} variant={patents === "Yes" ? "default" : "outline"}>
                    Yes
                  </Button>
                  <Button onClick={() => setPatents("No")} variant={patents === "No" ? "default" : "outline"}>
                    No
                  </Button>
                </div>
                {patents === "Yes" && (
                  <div>
                    <div className="mb-2">Upload your patents below.</div>
                    <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
                  </div>
                )}
                {patents === "No" && (
                  <div>
                    <div className="mb-2">Please explain your plans for patents below.</div>
                    <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
                  </div>
                )}
              </>
            )}
            {ownIp === "No" && (
              <div>
                <div className="mb-2">Please explain the current status of your IP below.</div>
                <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IpTaskLogic;
