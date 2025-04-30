
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  
  const isAdminRoute = location.pathname.startsWith(PATHS.ADMIN) || 
                        location.pathname.includes("lead-generator");

  console.log("ProtectedRoute - Auth state:", { 
    isAuthenticated, 
    isAdmin, 
    loading, 
    isAdminRoute, 
    pathname: location.pathname 
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    // Store the current path for redirect after login
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // For admin routes, check if user has admin privileges
  if (isAdminRoute && !isAdmin) {
    console.log("User doesn't have admin privileges, redirecting to home");
    return <Navigate to={PATHS.HOME} replace />;
  }

  // Render the protected outlet
  console.log("User authenticated, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute;
