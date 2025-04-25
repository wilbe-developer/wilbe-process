
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PATHS } from "@/lib/constants";
import SprintSignupForm from "@/components/sprint/SprintSignupForm";

const SprintSignupPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if authenticated user already has a sprint profile, if so redirect to dashboard
    const checkExistingProfile = async () => {
      if (!loading && isAuthenticated && user) {
        try {
          const { data: hasProfile, error } = await supabase
            .rpc('has_completed_sprint_onboarding', {
              p_user_id: user.id
            });

          if (error) {
            console.error('Error checking sprint profile:', error);
            return;
          }

          if (hasProfile) {
            // User already has a profile, redirect to dashboard
            navigate(PATHS.SPRINT_DASHBOARD);
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkExistingProfile();
  }, [isAuthenticated, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <SprintSignupForm />
    </div>
  );
};

export default SprintSignupPage;
