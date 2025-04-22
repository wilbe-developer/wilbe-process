
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PATHS } from "@/lib/constants";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { sendWelcomeEmail } from "@/services/emailService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSprintFileUpload } from "./useSprintFileUpload";
import { useSprintProfile } from "./useSprintProfile";
import { steps } from "@/components/sprint/SprintSignupSteps";

export const useSprintSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SprintSignupAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { uploadedFile, handleFileUpload } = useSprintFileUpload();
  const { updateUserSprintData } = useSprintProfile();

  const handleChange = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: string, value: string) => {
    const current = answers[field] || [];
    if (Array.isArray(current) && current.includes(value)) {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: current.filter((v: string) => v !== value) 
      }));
    } else {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: [...(Array.isArray(current) ? current : []), value] 
      }));
    }
  };

  const goToNextStep = () => {
    if (steps[currentStep].id === 'funding_received') {
      const fundingReceived = answers['funding_received'];
      if (fundingReceived !== 'yes') {
        setCurrentStep(currentStep + 2);
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1 && steps[currentStep - 1]?.id === 'funding_details') {
      const fundingReceived = answers['funding_received'];
      if (fundingReceived !== 'yes') {
        setCurrentStep(currentStep - 2);
        return;
      }
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const silentSignup = async () => {
    try {
      setIsSubmitting(true);
      
      if (isAuthenticated && user) {
        console.log("User already authenticated, updating sprint profile");
        await updateUserSprintData(user.id, answers, uploadedFile);
        
        toast({
          title: "Sprint updated!",
          description: "Your personalized founder sprint has been updated.",
        });
        
        navigate(PATHS.SPRINT_DASHBOARD);
        return;
      }

      console.log("Creating new user with signup");
      const randomPassword = Math.random().toString(36).slice(-10);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: answers.email,
        password: randomPassword,
        options: {
          data: {
            firstName: answers.name?.split(' ')[0] || '',
            lastName: answers.name?.split(' ').slice(1).join(' ') || '',
            linkedIn: answers.linkedin,
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user");
      }
      
      await updateUserSprintData(authData.user.id, answers, uploadedFile);
      
      await sendWelcomeEmail(answers.email, answers.name || 'Founder');
      
      toast({
        title: "Sprint setup complete!",
        description: "Welcome to your personalized founder sprint. Let's get started!",
      });
      
      navigate(PATHS.SPRINT_DASHBOARD);
      
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldRenderCurrentStep = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return true;
    
    if (currentStepData.id === 'funding_details') {
      return answers.funding_received === 'yes';
    }
    
    return true;
  };

  useEffect(() => {
    if (!shouldRenderCurrentStep()) {
      goToNextStep();
    }
  }, [currentStep, answers.funding_received]);

  return {
    currentStep,
    answers,
    isSubmitting,
    uploadedFile,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup,
    shouldRenderCurrentStep
  };
};
