
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { toast } from "sonner";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { useSprintFileUpload } from "./useSprintFileUpload";
import { useAuth } from "./useAuth";

export const useSprintSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFounderProfile } = useSprintFileUpload();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const silentSignup = async (answers: SprintSignupAnswers) => {
    setIsSubmitting(true);
    try {
      // Make sure we have an email for creating a new account
      if (!isAuthenticated && !answers.email) {
        toast.error("Email is required to create your sprint profile.");
        return;
      }

      let userId = user?.id;

      // If no user exists, create one using the provided email
      if (!isAuthenticated) {
        console.log("Creating new user with email:", answers.email);
        
        // Generate a random password
        const tempPassword = Math.random().toString(36).slice(-10);
        
        // Sign up with the provided email
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: answers.email,
          password: tempPassword,
          options: {
            data: { 
              tempAccount: true,
              firstName: answers.name?.split(' ')[0] || '',
              lastName: answers.name?.split(' ').slice(1).join(' ') || ''
            }
          }
        });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw signUpError;
        }
        
        if (!authData.user) {
          throw new Error("Failed to create user account");
        }
        
        console.log("User created successfully:", authData.user.id);
        userId = authData.user.id;

        // Send welcome email with password reset instructions
        toast.success(
          "Account created! Please check your email to set your password.",
          { duration: 6000 }
        );
      }

      if (!userId) {
        throw new Error("Failed to get user ID");
      }

      console.log("Creating/updating sprint profile for user:", userId);

      // Create/update the profile in Supabase
      const { error: profileError } = await supabase.rpc('create_sprint_profile', {
        p_user_id: userId,
        p_name: answers.name || '',
        p_email: answers.email || '',
        p_linkedin_url: answers.linkedin || '',
        p_cv_url: answers.founder_profile,
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
        console.error("Profile error:", profileError);
        throw profileError;
      }

      console.log("Sprint profile updated successfully");
      toast.success("Sprint profile updated successfully!");
      navigate(PATHS.SPRINT_DASHBOARD);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update sprint profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    silentSignup
  };
};
