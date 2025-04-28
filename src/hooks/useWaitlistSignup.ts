
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
        const { data: referrer } = await supabase
          .from('waitlist_signups')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrer) {
          referrerId = referrer.id;
          // Increment successful_referrals for the referrer
          await supabase
            .from('waitlist_signups')
            .update({ successful_referrals: supabase.sql`successful_referrals + 1` })
            .eq('id', referrerId);
        }
      }

      // Insert the new signup
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
