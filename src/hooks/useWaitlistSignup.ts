
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useWaitlistSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (
    name: string, 
    email: string, 
    referralCode?: string, 
    utmSource?: string, 
    utmMedium?: string
  ) => {
    setIsLoading(true);
    try {
      // Generate a unique referral code
      let newReferralCode: string;
      let isUnique = false;

      while (!isUnique) {
        newReferralCode = Math.random().toString(36).substring(2, 10);
        const { data: existing } = await supabase
          .from('waitlist_signups')
          .select('id')
          .eq('referral_code', newReferralCode)
          .single();

        if (!existing) isUnique = true;
      }
      
      let referrerId = null;
      let referrerName = null;
      if (referralCode) {
        console.log("Referral code provided:", referralCode);
        const { data: referrer, error: referrerError } = await supabase
          .from('waitlist_signups')
          .select('id, name, successful_referrals')
          .eq('referral_code', referralCode)
          .single();
        
        console.log("Referrer data:", referrer, "Error:", referrerError);
        
        if (referrer) {
          referrerId = referrer.id;
          referrerName = referrer.name;
          console.log("Found referrer with ID:", referrerId, "Current referrals:", referrer.successful_referrals);
          
          // First insert the new signup
          const { error: signupError } = await supabase
            .from('waitlist_signups')
            .insert({
              name,
              email,
              referral_code: newReferralCode,
              referrer_id: referrerId,
              utm_source: utmSource,
              utm_medium: utmMedium
            });

          if (signupError) throw signupError;
          
          // Now increment the referral count using the RPC call
          const { error: rpcError } = await supabase
            .rpc('increment_referral_count', {
              p_referrer_id: referrerId
            });
          
          if (rpcError) {
            console.error("Failed to increment referral count:", rpcError);
            toast.error("Referral was recorded but counter update failed. Please contact support.");
          }
          
          const referralLink = `${window.location.origin}/ref/${newReferralCode}`;
          
          // Send waitlist notification
          try {
            await fetch('/api/send-waitlist-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                email,
                referralLink,
                referrerName,
                utmSource,
                utmMedium
              }),
            });
          } catch (notificationError) {
            console.error("Failed to send notifications:", notificationError);
            // Continue with navigation even if notification fails
          }
          
          navigate('/referral', { 
            state: { 
              referralLink
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
          referrer_id: referrerId,
          utm_source: utmSource,
          utm_medium: utmMedium
        });

      if (error) throw error;

      const referralLink = `${window.location.origin}/ref/${newReferralCode}`;
      
      // Send waitlist notification
      try {
        await fetch('/api/send-waitlist-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            referralLink,
            referrerName,
            utmSource,
            utmMedium
          }),
        });
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError);
        // Continue with navigation even if notification fails
      }

      navigate('/referral', { 
        state: { 
          referralLink
        } 
      });

    } catch (error: any) {
      console.error('Error in waitlist signup:', error);
      if (error.code === '23505') {
        if (error.message?.includes('email')) {
          toast.error("This email has already joined the waitlist!");
        } else if (error.message?.includes('referral_code')) {
          toast.error("Something went wrong with the referral code. Please try again.");
        } else {
          toast.error("Duplicate entry detected. Please contact support if this persists.");
        }  
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
