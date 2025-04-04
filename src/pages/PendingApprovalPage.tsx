
import PendingApprovalCard from "@/components/PendingApprovalCard";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const PendingApprovalPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Check for auth hash in URL (for magic link redirects)
  useEffect(() => {
    const handleHashRedirect = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth session:', error);
      }
    };

    // Handle the hash if present
    if (window.location.hash && window.location.hash.includes('access_token')) {
      handleHashRedirect();
    }
  }, []);
  
  // Redirect approved users to home
  useEffect(() => {
    if (isAuthenticated && user?.approved) {
      navigate(PATHS.HOME);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <PendingApprovalCard />
    </div>
  );
};

export default PendingApprovalPage;
