
import PendingApprovalCard from "@/components/PendingApprovalCard";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/lib/constants";

const PendingApprovalPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
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
