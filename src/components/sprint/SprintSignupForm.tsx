
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useSprintSignup } from "@/hooks/useSprintSignup";
import { SprintFormField } from "./SprintFormField";
import { steps } from "./SprintSignupSteps";

const SprintSignupForm = () => {
  const {
    currentStep,
    answers,
    isSubmitting,
    uploadedFile,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup
  } = useSprintSignup();

  // Check if the current step is answered
  const isCurrentStepAnswered = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;
    
    if (currentStepData.type === 'file') return true;
    
    if (currentStepData.type === 'conditional') {
      if (currentStepData.conditional) {
        const isConditionMet = currentStepData.conditional.some(condition => 
          answers[condition.field] === condition.value
        );
        
        if (!isConditionMet) return true;
        return !!answers[currentStepData.id];
      }
      return true;
    }
    
    if (currentStepData.type === 'checkbox') {
      return Array.isArray(answers[currentStepData.id]) && answers[currentStepData.id].length > 0;
    }
    
    return !!answers[currentStepData.id];
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⚡ Founder Sprint Sign-Up</h1>
        <p className="text-muted-foreground">We surface great founders. We help everyone else.</p>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-brand-pink h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold">{currentStepData.question}</h2>
            {currentStepData.description && (
              <p className="text-muted-foreground">{currentStepData.description}</p>
            )}
            
            <SprintFormField
              step={currentStepData}
              value={answers[currentStepData.id]}
              onChange={handleChange}
              onFileUpload={handleFileUpload}
              toggleMultiSelect={toggleMultiSelect}
              uploadedFile={uploadedFile}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {isLastStep ? (
          <Button 
            onClick={silentSignup}
            disabled={!isCurrentStepAnswered() || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? "Creating your sprint..." : "Personalize My Sprint"} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={goToNextStep}
            disabled={!isCurrentStepAnswered()}
            className="ml-auto"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SprintSignupForm;
