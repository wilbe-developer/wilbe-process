
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {isAuthenticated && !isMobile && <Sidebar />}
      {isAuthenticated && <MobileSidebar />}
      <div className={`${isAuthenticated && !isMobile ? "pl-[214px]" : ""}`}>
        <div className="overflow-x-hidden">
          <AppHeader />
          <main className="p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
