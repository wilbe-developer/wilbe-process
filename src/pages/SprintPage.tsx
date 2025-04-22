
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const SprintPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSprintOnboarding = async () => {
      if (!loading) {
        if (!isAuthenticated) {
          sessionStorage.setItem("redirectAfterLogin", PATHS.SPRINT_DASHBOARD);
          navigate(PATHS.LOGIN);
          return;
        }

        // Check if user has completed sprint onboarding
        if (user) {
          const { data, error } = await supabase
            .rpc('has_completed_sprint_onboarding', {
              p_user_id: user.id
            });

          if (error) {
            console.error('Error checking sprint onboarding:', error);
            return;
          }

          if (!data) {
            navigate(PATHS.SPRINT_SIGNUP);
            return;
          }

          navigate(PATHS.SPRINT_DASHBOARD);
        }
      }
    };

    checkSprintOnboarding();
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default SprintPage;
