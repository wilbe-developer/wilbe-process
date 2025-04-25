
import { useState, useEffect } from "react";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { useSprintAnswers } from "./useSprintAnswers";
import { useSprintFileUpload } from "./useSprintFileUpload";
import { useSprintSubmission } from "./useSprintSubmission";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useSprintSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSprintProfile, setHasSprintProfile] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const {
    answers,
    setAnswers,
    handleChange,
    toggleMultiSelect
  } = useSprintAnswers();
  
  const {
    uploadedFile,
    handleFileUpload
  } = useSprintFileUpload();
  
  const {
    isSubmitting,
    silentSignup
  } = useSprintSubmission();

  useEffect(() => {
    const fetchSprintProfile = async () => {
      if (isAuthenticated && user) {
        const { data: profile, error } = await supabase
          .from('sprint_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && profile) {
          setHasSprintProfile(true);
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
  }, [isAuthenticated, user, setAnswers]);

  const goToNextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

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
    shouldRenderCurrentStep: () => true
  };
};
