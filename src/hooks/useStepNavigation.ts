
import { useState } from "react";

interface UseStepNavigationProps {
  totalSteps: number;
  onComplete?: (fileId?: string) => void;
}

export const useStepNavigation = ({ totalSteps, onComplete }: UseStepNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
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
  
  return {
    currentStep,
    answers,
    isLastStep,
    handleAnswerSelect,
    goToNextStep,
    goToPreviousStep,
    progress: ((currentStep + 1) / totalSteps) * 100
  };
};
