
import { useState, useEffect } from "react";

interface UseStepNavigationProps {
  totalSteps: number;
  initialStep?: number;
  onComplete?: (fileId?: string) => void;
  conditionalFlow?: Record<number, Record<string, number>>;
}

export const useStepNavigation = ({ 
  totalSteps, 
  initialStep = 0,
  onComplete,
  conditionalFlow = {}
}: UseStepNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
  };
  
  const getNextStep = (current: number, answer?: string): number => {
    // Check if the current step has conditional navigation based on the answer
    if (conditionalFlow[current] && answer && conditionalFlow[current][answer] !== undefined) {
      return conditionalFlow[current][answer];
    }
    // Default to the next sequential step
    return current + 1;
  };
  
  const goToNextStep = () => {
    const answer = answers[currentStep];
    if (currentStep < totalSteps - 1) {
      const nextStep = getNextStep(currentStep, answer);
      setCurrentStep(nextStep);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleComplete = (fileId?: string) => {
    setIsSubmitting(true);
    
    try {
      if (fileId) {
        setUploadedFileId(fileId);
      }
      
      if (onComplete) {
        onComplete(fileId || uploadedFileId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLastStep = currentStep === totalSteps - 1;
  
  return {
    currentStep,
    answers,
    isLastStep,
    uploadedFileId,
    isSubmitting,
    setUploadedFileId,
    handleAnswerSelect,
    goToNextStep,
    goToPreviousStep,
    handleComplete,
    progress: ((currentStep + 1) / totalSteps) * 100
  };
};
