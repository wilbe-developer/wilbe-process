
import React from "react";
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
    hasSprintProfile,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup,
    shouldRenderCurrentStep
  } = useSprintSignup();
  
  const { isAuthenticated, user } = useAuth();

  const isCurrentStepAnswered = () => {
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

  // Validate that we have email before submitting
  const canSubmit = () => {
    // If user is authenticated, they already have an email
    if (isAuthenticated) return isCurrentStepAnswered();
    
    // For new users, ensure we have an email before allowing submission
    return isCurrentStepAnswered() && !!answers.email;
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = currentStep < steps.length ? steps[currentStep] : null;
  const isWithinNormalStepRange = currentStep < steps.length;

  // Show error if we're on the final step and missing email
  const showEmailRequiredError = isLastStep && !isAuthenticated && !answers.email;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⚡ Founder Sprint Sign-Up</h1>
        <p className="text-muted-foreground">We surface great founders. We help everyone else.</p>
        
        {isAuthenticated && user && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <p className="font-medium">Welcome back, {user.firstName}!</p>
            <p className="mt-1">
              {hasSprintProfile 
                ? "You can update your sprint profile below." 
                : "Please complete your sprint profile to get started."}
            </p>
          </div>
        )}
      </div>
      
      {isWithinNormalStepRange && (
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
      
      {currentStepData && (
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
      
      {showEmailRequiredError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="text-sm font-medium">Email is required to create your account.</p>
          <p className="text-xs mt-1">Please navigate to the "Contact Information" step to provide your email.</p>
        </div>
      )}
      
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
            onClick={() => silentSignup(answers)}
            disabled={!canSubmit() || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting 
              ? (hasSprintProfile ? "Updating your sprint..." : "Creating your sprint...") 
              : (hasSprintProfile ? "Update My Sprint" : "Start My Sprint")} 
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
