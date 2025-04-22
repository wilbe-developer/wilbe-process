
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FileUploader from "@/components/sprint/FileUploader";

interface StepBasedTaskLogicProps {
  steps: Array<{
    type: 'question' | 'content' | 'upload';
    question?: string;
    content?: string | string[];
    options?: Array<{
      label: string;
      value: string;
    }>;
    uploads?: string[];
    action?: string;
  }>;
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
}

const StepBasedTaskLogic: React.FC<StepBasedTaskLogicProps> = ({
  steps,
  isCompleted,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const step = steps[currentStep];
  const totalSteps = steps.length;
  
  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
  };
  
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const isLastStep = currentStep === totalSteps - 1;
  const hasAnswer = answers[currentStep] !== undefined || step.type === 'content' || step.type === 'upload';
  
  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-brand-pink h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step content */}
        <div className="min-h-[200px]">
          {step.type === 'question' && step.question && (
            <>
              <h2 className="text-lg font-semibold mb-4">{step.question}</h2>
              {step.options && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {step.options.map(option => (
                    <Button
                      key={option.value}
                      variant={answers[currentStep] === option.value ? "default" : "outline"}
                      onClick={() => handleAnswerSelect(option.value)}
                      className="flex-grow md:flex-grow-0"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
          
          {step.type === 'content' && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Information:</h3>
              {Array.isArray(step.content) ? (
                <ul className="list-disc list-inside space-y-2">
                  {step.content.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">{step.content}</p>
              )}
            </div>
          )}
          
          {step.type === 'upload' && (
            <div>
              {step.action && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">{step.action}</p>
                </div>
              )}
              
              {step.uploads && step.uploads.length > 0 && (
                <>
                  <div className="mb-2 font-medium">Required uploads:</div>
                  <ul className="list-disc list-inside mb-4">
                    {step.uploads.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              
              <FileUploader
                isCompleted={isCompleted}
                onFileUploaded={() => onComplete()}
              />
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={() => onComplete()}
              disabled={!hasAnswer || isCompleted}
              size="sm"
            >
              Complete
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!hasAnswer}
              size="sm"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StepBasedTaskLogic;
