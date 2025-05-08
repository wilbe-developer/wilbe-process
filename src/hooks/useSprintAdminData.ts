
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type WaitlistSignup = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  referral_code: string;
  referrer_id: string | null;
  successful_referrals: number;
  utm_source: string | null;
  utm_medium: string | null;
};

export type SprintProfile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
};

export type UTMSource = {
  source: string;
  count: number;
};

export type UTMMedium = {
  medium: string;
  count: number;
};

export type ReferralStats = {
  totalSignups: number;
  totalReferrals: number;
  topReferrers: Array<{
    name: string;
    email: string;
    referrals: number;
  }>;
};

export const useSprintAdminData = () => {
  const [waitlistSignups, setWaitlistSignups] = useState<WaitlistSignup[]>([]);
  const [sprintProfiles, setSprintProfiles] = useState<SprintProfile[]>([]);
  const [utmSources, setUtmSources] = useState<UTMSource[]>([]);
  const [utmMediums, setUtmMediums] = useState<UTMMedium[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalSignups: 0,
    totalReferrals: 0,
    topReferrers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all waitlist signups
  const fetchWaitlistSignups = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("waitlist_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setWaitlistSignups(data as WaitlistSignup[]);
        calculateReferralStats(data as WaitlistSignup[]);
        analyzeUTMData(data as WaitlistSignup[]);
      }
    } catch (error: any) {
      console.error("Error fetching waitlist signups:", error);
      toast.error("Failed to load waitlist data");
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all sprint profiles
  const fetchSprintProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("sprint_profiles")
        .select("id, user_id, name, email, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setSprintProfiles(data as SprintProfile[]);
      }
    } catch (error: any) {
      console.error("Error fetching sprint profiles:", error);
      toast.error("Failed to load sprint profile data");
    }
  };

  // Calculate referral statistics
  const calculateReferralStats = (signups: WaitlistSignup[]) => {
    const totalSignups = signups.length;
    const signupsWithReferrers = signups.filter(signup => signup.referrer_id).length;
    
    // Get top referrers
    const referrerMap = new Map<string, { name: string; email: string; referrals: number }>();
    
    signups.forEach(signup => {
      if (signup.successful_referrals > 0) {
        referrerMap.set(signup.id, {
          name: signup.name,
          email: signup.email,
          referrals: signup.successful_referrals
        });
      }
    });
    
    const topReferrers = Array.from(referrerMap.values())
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 10);
    
    setReferralStats({
      totalSignups,
      totalReferrals: signupsWithReferrers,
      topReferrers
    });
  };

  // Analyze UTM data
  const analyzeUTMData = (signups: WaitlistSignup[]) => {
    const sourceMap = new Map<string, number>();
    const mediumMap = new Map<string, number>();
    
    signups.forEach(signup => {
      if (signup.utm_source) {
        const currentCount = sourceMap.get(signup.utm_source) || 0;
        sourceMap.set(signup.utm_source, currentCount + 1);
      }
      
      if (signup.utm_medium) {
        const currentCount = mediumMap.get(signup.utm_medium) || 0;
        mediumMap.set(signup.utm_medium, currentCount + 1);
      }
    });
    
    const utmSourcesArray = Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      count
    })).sort((a, b) => b.count - a.count);
    
    const utmMediumsArray = Array.from(mediumMap.entries()).map(([medium, count]) => ({
      medium,
      count
    })).sort((a, b) => b.count - a.count);
    
    setUtmSources(utmSourcesArray);
    setUtmMediums(utmMediumsArray);
  };

  // Initialize data fetching
  useEffect(() => {
    fetchWaitlistSignups();
    fetchSprintProfiles();
  }, []);

  // Refresh data
  const refreshData = () => {
    fetchWaitlistSignups();
    fetchSprintProfiles();
  };

  return {
    waitlistSignups,
    sprintProfiles,
    referralStats,
    utmSources,
    utmMediums,
    isLoading,
    error,
    refreshData
  };
};
