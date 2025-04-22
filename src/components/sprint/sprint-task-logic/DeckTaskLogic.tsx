
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/sprint/FileUploader";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode; // Added children prop
};

const VIDEO_PLACEHOLDER = (
  <div className="mb-6 bg-gray-100 p-4 rounded flex items-center">
    <span role="img" aria-label="video" className="mr-2">🎬</span>
    <div>
      <div className="font-medium">Deck Template Walkthrough (Video Placeholder)</div>
      <div className="text-sm text-gray-500">This will include a walkthrough of the 15-slide deck template with audio for each slide.</div>
    </div>
  </div>
);

const DECK_TEMPLATE_PLACEHOLDER = (
  <div className="mb-6 bg-gray-100 p-4 rounded flex items-center">
    <span role="img" aria-label="deck" className="mr-2">💾</span>
    <div>
      <div className="font-medium">Download: 15-slide Deck Template (Placeholder)</div>
      <Button size="sm" variant="outline" className="ml-4" disabled>Coming Soon</Button>
    </div>
  </div>
);

const DeckTaskLogic: React.FC<Props> = ({ isCompleted, onComplete, hideMainQuestion, children }) => {
  const [hasDeck, setHasDeck] = useState<string | null>(null);
  const [fitsTemplate, setFitsTemplate] = useState<string | null>(null);
  const [step, setStep] = useState<"q1" | "q2" | "final">("q1");

  // If the main question comes from onboarding, skip question flow
  React.useEffect(() => {
    if (hideMainQuestion) {
      setStep("final");
    }
  }, [hideMainQuestion]);

  // Handlers for question flow
  const handleFirstAnswer = (answer: string) => {
    setHasDeck(answer);
    if (answer === "Yes") {
      setStep("q2");
    } else {
      setFitsTemplate(null);
      setStep("final");
    }
  };
  const handleSecondAnswer = (answer: string) => {
    setFitsTemplate(answer);
    setStep("final");
  };

  // File upload complete calls parent's handler
  const onFileUploaded = (fileId: string) => {
    onComplete(fileId);
  };

  return (
    <div>
      {children} {/* Render children prop */}
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col space-y-6">
          {!hideMainQuestion && step === "q1" && (
            <>
              <h2 className="text-xl font-semibold mb-2">Do you have a slide deck for your planned venture?</h2>
              <div className="flex gap-4">
                <Button onClick={() => handleFirstAnswer("Yes")} variant={hasDeck === "Yes" ? "default" : "outline"}>Yes</Button>
                <Button onClick={() => handleFirstAnswer("No")} variant={hasDeck === "No" ? "default" : "outline"}>No</Button>
              </div>
            </>
          )}

          {!hideMainQuestion && step === "q2" && (
            <>
              <h2 className="text-xl font-semibold mb-2">Does it fit the 15-slide template?</h2>
              <div className="flex gap-4">
                <Button onClick={() => handleSecondAnswer("Yes")} variant={fitsTemplate === "Yes" ? "default" : "outline"}>Yes</Button>
                <Button onClick={() => handleSecondAnswer("No")} variant={fitsTemplate === "No" ? "default" : "outline"}>No</Button>
              </div>
            </>
          )}

          {step === "final" && (
            <>
              {hasDeck === "No" || fitsTemplate === "No" ? (
                <>
                  <div className="mb-4">
                    <strong>You'll need to upload a new slide deck using our 15-slide template.</strong>
                  </div>
                  {DECK_TEMPLATE_PLACEHOLDER}
                  {VIDEO_PLACEHOLDER}
                </>
              ) : (
                <div className="mb-4">
                  <strong>Upload your slide deck below.</strong>
                </div>
              )}

              <FileUploader
                onFileUploaded={onFileUploaded}
                isCompleted={isCompleted}
              />

              <div className="mt-6">
                <div className="font-medium text-gray-700">Exercise:</div>
                <ul className="list-disc list-inside text-gray-600 mt-2">
                  <li>15-slide deck based on template</li>
                  <li>Audio file accompanying deck explaining each slide (To be uploaded separately)</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeckTaskLogic;
