
-- Create a function to safely increment the referral count
CREATE OR REPLACE FUNCTION increment_referral_count(p_referrer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE waitlist_signups
  SET successful_referrals = COALESCE(successful_referrals, 0) + 1
  WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql;
