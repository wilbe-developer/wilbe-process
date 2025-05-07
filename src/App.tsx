
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import MerchPage from "@/pages/MerchPage";

// Layout
import Layout from "@/components/Layout";
import SprintLayout from "@/components/sprint/SprintLayout";

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
import LandingPage from "@/components/LandingPageOld";
import BsfPage from "@/components/BsfOld";
import EventsPage from "@/pages/EventsPage";
import BuildYourDeckPage from "@/pages/BuildYourDeckPage";
import SprintPage from "@/pages/SprintPage";
import SprintDashboardPage from "@/pages/SprintDashboardPage";
import SprintTaskPage from "@/pages/SprintTaskPage";
import SprintSignupPage from "@/pages/SprintSignupPage";
import CommunityPage from "@/pages/CommunityPage";
import NewThreadPage from "@/pages/NewThreadPage";
import ThreadPage from "@/pages/ThreadPage";
import SprintWaitlistPage from "@/pages/SprintWaitlistPage";
import SprintReferralPage from "@/pages/SprintReferralPage";
import LeadGeneratorPage from "@/pages/LeadGeneratorPage";

// Auth Route component
import ProtectedRoute from "@/components/ProtectedRoute";
import MemberRoute from "@/components/MemberRoute";

// MetaWrapper for per-page <Helmet> tags
import MetaWrapper from "@/components/MetaWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MetaWrapper>
            <Routes>
              {/* Public merch chooser route */}
              <Route path="/merch" element={<MerchPage />} />

              {/* Auth routes */}
              <Route path={PATHS.LOGIN} element={<LoginPage />} />
              <Route path={PATHS.REGISTER} element={<RegisterPage />} />
              <Route path={PATHS.PENDING} element={<PendingApprovalPage />} />
              <Route path={PATHS.LANDING_PAGE} element={<LandingPage />} />
              <Route path={PATHS.BSF_PAGE} element={<BsfPage />} />

              {/* Sprint signup - publicly accessible */}
              <Route path="/sprint-signup" element={<SprintSignupPage />} />

              {/* Sprint routes - accessible to all authenticated users */}
              <Route path={PATHS.SPRINT} element={<SprintPage />} />
              <Route element={<SprintLayout />}>
                <Route element={<ProtectedRoute />}>
                  <Route path={PATHS.SPRINT_DASHBOARD} element={<SprintDashboardPage />} />
                  <Route path={`${PATHS.SPRINT_TASK}/:taskId`} element={<SprintTaskPage />} />
                </Route>
              </Route>

              {/* Community pages - require member approval */}
              <Route element={<SprintLayout />}>
                <Route element={<MemberRoute />}>
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/new" element={<NewThreadPage />} />
                  <Route path="/community/thread/:threadId" element={<ThreadPage />} />
                </Route>
              </Route>

              {/* Sprint waitlist routes */}
              <Route path="/waitlist" element={<SprintWaitlistPage />} />
              <Route path="/referral" element={<SprintReferralPage />} />
              <Route path="/ref/:code" element={<SprintWaitlistPage />} />

              {/* Member-only protected routes */}
              <Route element={<Layout />}>
                <Route element={<MemberRoute />}>
                  <Route path={PATHS.HOME} element={<HomePage />} />
                  <Route path={PATHS.KNOWLEDGE_CENTER} element={<KnowledgeCenterPage />} />
                  <Route path={PATHS.MEMBER_DIRECTORY} element={<MemberDirectoryPage />} />
                  <Route path={`${PATHS.VIDEO}/:videoId`} element={<VideoPlayerPage />} />
                  <Route path={PATHS.EVENTS} element={<EventsPage />} />
                  <Route path={PATHS.BUILD_YOUR_DECK} element={<BuildYourDeckPage />} />
                  <Route path={PATHS.PROFILE} element={<ProfilePage />} />

                  {/* Placeholder routes */}
                  <Route path={PATHS.LAB_SEARCH} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Lab Search</h1><p>This feature is coming soon.</p></div>} />
                  <Route path={PATHS.ASK} element={<div className="py-12 text-center"><h1 className="text-2xl font-bold mb-4">Ask & Invite</h1><p>This feature is coming soon.</p></div>} />
                </Route>
                
                {/* Admin routes with admin check */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path={PATHS.ADMIN} element={<AdminPage />} />
                  <Route path="/lead-generator" element={<LeadGeneratorPage />} />
                </Route>
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MetaWrapper>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
