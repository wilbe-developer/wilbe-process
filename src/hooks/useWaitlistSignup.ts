
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useWaitlistSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (name: string, email: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      const newReferralCode = btoa(email).slice(0, 8);
      
      let referrerId = null;
      if (referralCode) {
        console.log("Referral code provided:", referralCode);
        const { data: referrer, error: referrerError } = await supabase
          .from('waitlist_signups')
          .select('id, successful_referrals')
          .eq('referral_code', referralCode)
          .single();
        
        console.log("Referrer data:", referrer, "Error:", referrerError);
        
        if (referrer) {
          referrerId = referrer.id;
          console.log("Found referrer with ID:", referrerId, "Current referrals:", referrer.successful_referrals);
          
          // First insert the new signup
          const { error: signupError } = await supabase
            .from('waitlist_signups')
            .insert({
              name,
              email,
              referral_code: newReferralCode,
              referrer_id: referrerId
            });

          if (signupError) throw signupError;
          
          // Then increment the referral count with detailed logging
          console.log("Calling increment_referral_count with p_referrer_id:", referrerId);
          
          // Explicitly verify the function exists before calling
          const { data: functions } = await supabase
            .rpc('get_function_info', { function_name: 'increment_referral_count' });
          console.log("Function info:", functions);
          
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('increment_referral_count', {
              p_referrer_id: referrerId
            });
          
          console.log("RPC Response:", rpcData, "Error:", rpcError);
          
          if (rpcError) {
            console.error("Failed to increment referral count:", rpcError);
            // We'll still continue even if the increment fails
            toast.error("Referral was recorded but counter update failed. Please contact support.");
          } else {
            console.log("Successfully incremented referral count");
            
            // Double-check if the count was actually incremented
            const { data: updatedReferrer } = await supabase
              .from('waitlist_signups')
              .select('successful_referrals')
              .eq('id', referrerId)
              .single();
              
            console.log("Referral count after update:", updatedReferrer?.successful_referrals);
          }
          
          navigate('/sprint/referral', { 
            state: { 
              referralLink: `${window.location.origin}/sprint/ref/${newReferralCode}` 
            } 
          });
          
          return;
        }
      }

      // If there's no referrer or referral code, just add the new signup
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          name,
          email,
          referral_code: newReferralCode,
          referrer_id: referrerId
        });

      if (error) throw error;

      navigate('/sprint/referral', { 
        state: { 
          referralLink: `${window.location.origin}/sprint/ref/${newReferralCode}` 
        } 
      });

    } catch (error: any) {
      console.error('Error in waitlist signup:', error);
      if (error.code === '23505') { // unique violation
        toast.error("This email has already joined the waitlist!");
      } else {
        toast.error("Failed to join waitlist. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    isLoading
  };
};
