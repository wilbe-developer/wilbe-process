
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useSprintTasksManager } from "@/hooks/useSprintTasks";
import { toast } from "sonner";

const SprintPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const { createSprintTasks } = useSprintTasksManager();

  useEffect(() => {
    const checkSprintOnboarding = async () => {
      // Wait until auth state is loaded
      if (loading) return;

      // If not authenticated, redirect to signup (without storing redirect location)
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to sprint signup");
        navigate(PATHS.SPRINT_SIGNUP);
        return;
      }

      // Check if user has completed sprint onboarding (has a profile)
      if (user) {
        console.log("Checking if user has a sprint profile");
        try {
          const { data: hasProfile, error: profileError } = await supabase
            .rpc('has_completed_sprint_onboarding', {
              p_user_id: user.id
            });

          if (profileError) {
            console.error('Error checking sprint onboarding:', profileError);
            toast.error("Error checking your sprint status. Please try again.");
            return;
          }

          if (!hasProfile) {
            console.log("User has no sprint profile, redirecting to signup");
            navigate(PATHS.SPRINT_SIGNUP);
            return;
          }

          // Check if tasks exist for this user
          const { data: existingTasks, error: tasksError } = await supabase
            .from('sprint_tasks')
            .select('id')
            .eq('user_id', user.id);
            
          if (tasksError) {
            console.error('Error checking existing tasks:', tasksError);
          }
          
          // If no tasks exist, create them based on the user's profile
          if (!existingTasks || existingTasks.length === 0) {
            try {
              // Get user's sprint profile
              const { data: profile, error: profileFetchError } = await supabase
                .from('sprint_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
                
              if (profileFetchError) {
                console.error('Error fetching profile:', profileFetchError);
                toast.error("Failed to load your sprint profile.");
              } else if (profile) {
                // Convert the profile to the expected format for createSprintTasks
                const profileData = {
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
                  funding_details: profile.funding_details,
                  funding_amount_text: profile.funding_amount,
                  funding_sources: profile.funding_sources,
                  experiment: profile.experiment_validated ? 'yes' : 'no',
                  vision: profile.industry_changing_vision ? 'yes' : 'no'
                };
                
                await createSprintTasks(user.id, profileData);
                console.log("Created tasks for user based on profile");
              }
            } catch (error) {
              console.error('Error creating tasks from profile:', error);
            }
          }

          // Redirect to dashboard
          console.log("User has sprint profile, redirecting to dashboard");
          navigate(PATHS.SPRINT_DASHBOARD);
        } catch (error) {
          console.error('Error in sprint check flow:', error);
          toast.error("Something went wrong. Please try again.");
        }
      }
    };

    checkSprintOnboarding();
  }, [isAuthenticated, loading, navigate, user, createSprintTasks]);

  // Show loading spinner while checking
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your sprint...</p>
        </div>
      </div>
    );
  }

  // This should not be visible as we navigate away in the useEffect
  return null;
};

export default SprintPage;
