
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className={`${isAuthenticated ? "pl-[214px]" : ""}`}>
        <AppHeader />
        <main className={`p-6`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
