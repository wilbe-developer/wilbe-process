
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";

// Layout
import Layout from "@/components/Layout";

// Pages
import HomePage from "@/pages/HomePage";
import KnowledgeCenterPage from "@/pages/KnowledgeCenterPage";
import MemberDirectoryPage from "@/pages/MemberDirectoryPage";
import VideoPlayerPage from "@/pages/VideoPlayerPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PendingApprovalPage from "@/pages/PendingApprovalPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import LandingPage from "@/pages/LandingPage";
import LandingPage from "@/pages/BSFPage";

// Auth Route component
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path={PATHS.LOGIN} element={<LoginPage />} />
            <Route path={PATHS.REGISTER} element={<RegisterPage />} />
            <Route path={PATHS.PENDING} element={<PendingApprovalPage />} />
            <Route path={PATHS.LANDING_PAGE} element={<LandingPage />} />
            
            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route path={PATHS.HOME} element={<HomePage />} />
                <Route path={PATHS.KNOWLEDGE_CENTER} element={<KnowledgeCenterPage />} />
                <Route path={PATHS.MEMBER_DIRECTORY} element={<MemberDirectoryPage />} />
                <Route path={`${PATHS.VIDEO}/:videoId`} element={<VideoPlayerPage />} />
                <Route path={PATHS.ADMIN} element={<AdminPage />} />
                <Route path={PATHS.PROFILE} element={<ProfilePage />} />
                
                {/* Placeholder routes */}
                <Route path={PATHS.BUILD_YOUR_DECK} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Build Your Deck</h1><p>This feature is coming soon.</p></div>} />
                <Route path={PATHS.LAB_SEARCH} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Lab Search</h1><p>This feature is coming soon.</p></div>} />
                <Route path={PATHS.EVENTS} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Events</h1><p>This feature is coming soon.</p></div>} />
                <Route path={PATHS.ASK} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Ask & Invite</h1><p>This feature is coming soon.</p></div>} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
