
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SprintSignupAnswers } from "@/types/sprint-signup";
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
  const navigate = useNavigate();
  
  // Indicates if we're in authenticated user mode
  const [isAuthenticatedFlow, setIsAuthenticatedFlow] = useState(false);

  useEffect(() => {
    // If user is already authenticated, prepare for update mode
    if (isAuthenticated && user) {
      setIsAuthenticatedFlow(true);
      
      // Fetch existing answers if needed
      if (user.email) {
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          email: user.email
        }));
      }
      
      if (user.firstName && user.lastName) {
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          name: `${user.firstName} ${user.lastName}`
        }));
      }
    }
  }, [isAuthenticated, user]);

  const handleChange = (field: string, value: any) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [field]: value
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

      // Create/update the profile in Supabase
      const { error } = await supabase.rpc('create_sprint_profile', {
        p_user_id: user.id,
        p_name: answers.name || '',
        p_email: answers.email || '',
        p_linkedin_url: answers.linkedin || '',
        p_cv_url: filePath,
        p_current_job: answers.job || '',
        p_company_incorporated: answers.incorporated === 'yes',
        p_received_funding: answers.funding_received === 'yes',
        p_funding_details: answers.funding_details || '',
        p_has_deck: answers.deck === 'yes',
        p_team_status: answers.team || '',
        p_commercializing_invention: answers.invention === 'yes',
        p_university_ip: answers.ip === 'tto_yes' || answers.ip === 'tto_no',
        p_tto_engaged: answers.ip === 'tto_yes',
        p_problem_defined: answers.problem === 'yes',
        p_customer_engagement: answers.customers || '',
        p_market_known: answers.market_known === 'yes',
        p_market_gap_reason: answers.market_gap_reason || '',
        p_funding_amount: answers.funding_amount_text || '',
        p_has_financial_plan: answers.funding_plan === 'yes',
        p_funding_sources: Array.isArray(answers.funding_sources) ? answers.funding_sources : [],
        p_experiment_validated: answers.experiment === 'yes',
        p_industry_changing_vision: answers.vision === 'yes'
      });

      if (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update your profile. Please try again.");
        return;
      }

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
    return !isAuthenticatedFlow;
  };

  return {
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
  };
};
