
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
  
  const [hasSprintProfile, setHasSprintProfile] = useState(false);

  useEffect(() => {
    // Fetch existing sprint profile if user is authenticated
    const fetchSprintProfile = async () => {
      if (isAuthenticated && user) {
        const { data: profile, error } = await supabase
          .from('sprint_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && profile) {
          setHasSprintProfile(true);
          // Convert the profile data to match our form structure
          setAnswers({
            deck: profile.has_deck ? 'yes' : 'no',
            team: profile.team_status,
            invention: profile.commercializing_invention ? 'yes' : 'no',
            ip: profile.university_ip 
              ? (profile.tto_engaged ? 'tto_yes' : 'tto_no') 
              : 'own',
            problem: profile.problem_defined ? 'yes' : 'no',
            customers: profile.customer_engagement,
            market_known: profile.market_known ? 'yes' : 'no',
            funding_plan: profile.has_financial_plan ? 'yes' : 'no',
            funding_received: profile.received_funding ? 'yes' : 'no',
            funding_details: profile.funding_details || '',
            sprint_goals: [],
            founder_profile: null,
            funding_amount_text: profile.funding_amount || '',
            funding_sources: profile.funding_sources || [],
            experiment: profile.experiment_validated ? 'yes' : 'no',
            vision: profile.industry_changing_vision ? 'yes' : 'no',
            name: profile.name || '',
            email: profile.email || '',
            linkedin: profile.linkedin_url || '',
            job: profile.current_job || '',
            incorporated: profile.company_incorporated ? 'yes' : 'no',
            market_gap_reason: profile.market_gap_reason || ''
          });
        }
      }
    };

    fetchSprintProfile();
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
      let userId = user?.id;

      // If no user exists, create one
      if (!isAuthenticated) {
        const tempEmail = `user_${Date.now()}@temporary.com`;
        const tempPassword = Math.random().toString(36).slice(-10);
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
          options: {
            data: { tempAccount: true }
          }
        });

        if (signUpError) throw signUpError;
        userId = authData.user?.id;
      }

      if (!userId) {
        throw new Error("Failed to get user ID");
      }

      // Upload file if provided
      const filePath = uploadedFile ? await uploadFounderProfile(userId) : null;
      if (filePath) {
        setAnswers(prevAnswers => ({ ...prevAnswers, founder_profile: filePath }));
      }

      // Create/update the profile in Supabase
      const { error: profileError } = await supabase.rpc('create_sprint_profile', {
        p_user_id: userId,
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

      if (profileError) {
        throw profileError;
      }

      toast.success("Sprint profile updated successfully!");
      navigate(PATHS.SPRINT_DASHBOARD);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update sprint profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // We always want to show the form now, regardless of auth status
  const shouldRenderCurrentStep = () => true;

  return {
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
  };
};
