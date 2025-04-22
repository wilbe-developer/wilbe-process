import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { useSprintTasksManager } from "./useSprintTasks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/lib/constants";

export const useSprintSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SprintSignupAnswers>({
    deck: '',
    team: '',
    invention: '',
    ip: '',
    problem: '',
    customers: '',
    market_known: '',
    funding_plan: '',
    funding_received: '',
    funding_details: '',
    sprint_goals: [],
    founder_profile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { createSprintTasks } = useSprintTasksManager();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, skip to the end
    if (isAuthenticated) {
      setCurrentStep(99); // Just a high number to skip all steps
    }
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [name]: value
    }));
  };

  const toggleMultiSelect = (name: string, value: string) => {
    setAnswers(prevAnswers => {
      const currentValues = prevAnswers[name] as string[] || [];
      if (currentValues.includes(value)) {
        return {
          ...prevAnswers,
          [name]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prevAnswers,
          [name]: [...currentValues, value]
        };
      }
    });
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
  };

  const goToNextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const uploadFounderProfile = async (userId: string) => {
    if (!uploadedFile) {
      console.log("No file to upload");
      return null;
    }

    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const filePath = `founder-profiles/${userId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('sprint-storage')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("File upload error:", error);
        toast.error("Failed to upload file.");
        return null;
      }

      console.log("File uploaded successfully:", data);
      return filePath;
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      toast.error("Unexpected error during file upload.");
      return null;
    }
  };

  const silentSignup = async () => {
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error("User not found. Please sign in.");
        return;
      }

      // Upload file and get file path
      const filePath = await uploadFounderProfile(user.id);
      if (filePath) {
        setAnswers(prevAnswers => ({ ...prevAnswers, founder_profile: filePath }));
      }

      // Call createSprintTasks to create tasks
      await createSprintTasks(user.id, answers);

      toast.success("Sprint personalized successfully!");
      navigate(PATHS.SPRINT_DASHBOARD);
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Failed to personalize sprint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const shouldRenderCurrentStep = () => {
    return currentStep < 99;
  };

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
