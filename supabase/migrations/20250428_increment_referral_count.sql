
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.increment_referral_count(UUID);

-- Create a function to safely increment the referral count
-- with explicit schema references and debug logging
CREATE OR REPLACE FUNCTION public.increment_referral_count(p_referrer_id UUID)
RETURNS void AS $$
BEGIN
  RAISE LOG 'Incrementing referral count for user ID: %', p_referrer_id;
  
  UPDATE public.waitlist_signups
  SET successful_referrals = COALESCE(successful_referrals, 0) + 1
  WHERE id = p_referrer_id;
  
  -- Log the number of rows affected
  RAISE LOG 'Rows updated in waitlist_signups: %', ROW_COUNT();
END;
$$ LANGUAGE plpgsql;
