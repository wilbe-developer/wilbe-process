
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PATHS } from "@/lib/constants";
import HomePage from "./HomePage";

// This is just a wrapper to redirect to the appropriate page based on auth status
const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate(PATHS.LOGIN);
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <HomePage />;
};

export default Index;
