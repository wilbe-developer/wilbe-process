
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
      // Generate a unique referral code for this user
      const newReferralCode = btoa(email).slice(0, 8);
      
      // If this user was referred, find the referrer
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
          
          // First create the new signup
          const { error: signupError } = await supabase
            .from('waitlist_signups')
            .insert({
              name,
              email,
              referral_code: newReferralCode,
              referrer_id: referrerId
            });

          if (signupError) throw signupError;
          
          // Direct update approach - no RPC call
          console.log("Updating referrer count directly");
          const currentReferrals = referrer.successful_referrals === null ? 0 : referrer.successful_referrals;
          const newReferralCount = currentReferrals + 1;
          
          const { data: updateData, error: updateError } = await supabase
            .from('waitlist_signups')
            .update({ 
              successful_referrals: newReferralCount 
            })
            .eq('id', referrerId)
            .select();
          
          console.log("Update result:", updateData, "Update error:", updateError);
          
          if (updateError) {
            console.error("Update error:", updateError);
            toast.error("Referral was recorded but counter update failed. Please contact support.");
          }
          
          // Navigate to referral page with the new referral link
          navigate('/sprint/referral', { 
            state: { 
              referralLink: `${window.location.origin}/sprint/ref/${newReferralCode}` 
            } 
          });
          
          return; // Exit early as we've already handled everything
        }
      }

      // If no referrer or if the referrer wasn't found, just insert the new signup
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          name,
          email,
          referral_code: newReferralCode,
          referrer_id: referrerId
        });

      if (error) throw error;

      // Navigate to referral page with the new referral link
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
