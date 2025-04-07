
import PendingApprovalCard from "@/components/PendingApprovalCard";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const PendingApprovalPage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check for auth hash in URL (for magic link redirects)
  useEffect(() => {
    const handleHashRedirect = async () => {
      try {
        console.log("Processing auth hash from URL");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
        } else {
          console.log("Session processed:", !!data.session);
        }
      } catch (err) {
        console.error("Error processing auth hash:", err);
      }
    };

    // Handle the hash if present
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log("Auth hash detected in URL");
      handleHashRedirect();
    }
  }, []);
  
  // Redirect approved users to home
  useEffect(() => {
    if (!loading && isAuthenticated && user?.approved) {
      console.log("User is approved, redirecting to home");
      navigate(PATHS.HOME);
    }
  }, [isAuthenticated, user, navigate, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <PendingApprovalCard />
    </div>
  );
};

export default PendingApprovalPage;
