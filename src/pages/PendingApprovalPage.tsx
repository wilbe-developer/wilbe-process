
import PendingApprovalCard from "@/components/PendingApprovalCard";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const PendingApprovalPage = () => {
  const { isAuthenticated, user, loading, isApproved } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || PATHS.HOME;
  
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
    if (!loading && isAuthenticated) {
      if (isApproved) {
        console.log("User is approved, redirecting to:", from);
        navigate(from);
      } else {
        console.log("User is authenticated but not approved, showing pending screen");
      }
    }
  }, [isAuthenticated, isApproved, navigate, loading, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <PendingApprovalCard 
        userEmail={user?.email} 
        pendingReason="membership"
      />
    </div>
  );
};

export default PendingApprovalPage;
