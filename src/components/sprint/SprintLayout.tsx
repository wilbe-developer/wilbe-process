
import { useAuth } from "@/hooks/useAuth";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/lib/constants";
import { Home, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SprintLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to={PATHS.SPRINT_DASHBOARD} className="text-xl font-bold text-brand-pink">
            Sprint Dashboard
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to={PATHS.HOME}>
            <Button variant="ghost" size="icon" title="Go to Main App">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-sm text-right">
              <div className="font-medium">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="bg-white py-4 px-6 border-t text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Wilbe. Sprint Program.</p>
      </footer>
    </div>
  );
};

export default SprintLayout;
