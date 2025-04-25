import { supabase } from "@/integrations/supabase/client";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { useSprintTasksManager } from "./useSprintTasks";
import { useSprintFileUpload } from "./useSprintFileUpload";

export const useSprintProfile = () => {
  const { createSprintTasks } = useSprintTasksManager();
  const { uploadFounderProfile } = useSprintFileUpload();

  const updateUserSprintData = async (userId: string | null, answers: SprintSignupAnswers, uploadedFile: File | null) => {
    try {
      if (!userId) {
        console.error('No user ID available for sprint data update');
        return;
      }

      // Upload CV if provided
      let cvUrl = null;
      if (uploadedFile) {
        cvUrl = await uploadFounderProfile(userId);
      }

      // Create personalized sprint tasks for this user
      await createSprintTasks(userId, answers);

      // Call the create_sprint_profile RPC
      const { error: profileError } = await supabase.rpc('create_sprint_profile', {
        p_user_id: userId,
        p_name: answers.name || '',
        p_email: answers.email || '',
        p_linkedin_url: answers.linkedin || '',
        p_cv_url: cvUrl,
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
        console.error('Error creating/updating profile:', profileError);
        throw profileError;
      }
    } catch (error) {
      console.error('Error updating user sprint data:', error);
      throw error;
    }
  };

  return { updateUserSprintData };
};
