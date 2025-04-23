
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import QuestionStep from "./step-types/QuestionStep";
import ContentStep from "./step-types/ContentStep";
import UploadStep from "./step-types/UploadStep";

export type StepType = "question" | "content" | "upload";

export interface Step {
  type: StepType;
  question?: string;
  content?: string | string[];
  options?: Array<{
    label: string;
    value: string;
  }>;
  uploads?: string[];
  action?: string;
}

interface StepBasedTaskLogicProps {
  steps: Step[];
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  conditionalFlow?: Record<number, Record<string, number>>;
}

const StepBasedTaskLogic: React.FC<StepBasedTaskLogicProps> = ({
  steps,
  isCompleted,
  onComplete,
  conditionalFlow = {}
}) => {
  const {
    currentStep,
    answers,
    isLastStep,
    handleAnswerSelect,
    goToNextStep,
    goToPreviousStep,
    progress,
    handleComplete
  } = useStepNavigation({ 
    totalSteps: steps.length, 
    onComplete, 
    conditionalFlow 
  });
  
  const step = steps[currentStep];
  const hasAnswer = answers[currentStep] !== undefined || step.type === 'content' || step.type === 'upload';
  
  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-brand-pink h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step content */}
        <div className="min-h-[200px]">
          {step.type === 'question' && (
            <QuestionStep
              question={step.question || ''}
              options={step.options}
              selectedAnswer={answers[currentStep]}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
          
          {step.type === 'content' && step.content && (
            <ContentStep content={step.content} />
          )}
          
          {step.type === 'upload' && (
            <UploadStep
              action={step.action}
              uploads={step.uploads}
              isCompleted={isCompleted}
              onComplete={(fileId) => handleComplete(fileId)}
            />
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
          
          {step.type === 'upload' ? (
            // For upload steps, the Complete button is handled by UploadStep component
            <div></div>
          ) : isLastStep ? (
            <Button
              onClick={() => handleComplete()}
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
