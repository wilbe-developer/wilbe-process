
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useSprintSignup } from "@/hooks/useSprintSignup";
import { SprintFormField } from "./SprintFormField";
import { steps } from "./SprintSignupSteps";
import { useAuth } from "@/hooks/useAuth";

const SprintSignupForm = () => {
  const {
    currentStep,
    answers,
    isSubmitting,
    uploadedFile,
    isAuthenticatedFlow,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup,
    shouldRenderCurrentStep
  } = useSprintSignup();
  
  const { isAuthenticated, user } = useAuth();

  // Check if the current step is answered
  const isCurrentStepAnswered = () => {
    // If in authenticated flow, all steps are considered "answered"
    if (isAuthenticatedFlow) return true;
    
    // For regular flow, check if the current step is answered
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;
    
    if (currentStepData.type === 'file') return true;
    
    if (currentStepData.type === 'conditional') {
      if (currentStepData.id === 'funding_details') {
        return answers.funding_received === 'yes' ? !!answers.funding_details : true;
      }
      
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
  
  // Get the current step data safely
  const currentStepData = currentStep < steps.length ? steps[currentStep] : null;
  
  // Only show step indicator if we're within the normal step range
  const isWithinNormalStepRange = currentStep < steps.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⚡ Founder Sprint Sign-Up</h1>
        <p className="text-muted-foreground">We surface great founders. We help everyone else.</p>
        
        {isAuthenticated && user && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <p className="font-medium">Welcome back, {user.firstName}!</p>
            <p className="mt-1">To personalize your founder sprint, please click the button below.</p>
          </div>
        )}
      </div>
      
      {isWithinNormalStepRange && !isAuthenticatedFlow && (
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
      )}
      
      {/* Render form steps only for non-authenticated users */}
      {shouldRenderCurrentStep() && currentStepData && (
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
      )}
      
      {/* For authenticated users, show a direct button to personalize the sprint */}
      {isAuthenticatedFlow && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-semibold">Personalize Your Founder Sprint</h2>
              <p className="text-muted-foreground">
                Click the button below to create a customized sprint experience based on your profile.
              </p>
              <Button 
                onClick={silentSignup}
                disabled={isSubmitting}
                size="lg"
                className="mt-4"
              >
                {isSubmitting ? "Creating your sprint..." : "Personalize My Sprint"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Navigation buttons - only show for non-authenticated flow */}
      {!isAuthenticatedFlow && (
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
      )}
    </div>
  );
};

export default SprintSignupForm;
