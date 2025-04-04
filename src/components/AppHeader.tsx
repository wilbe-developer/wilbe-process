
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { PATHS } from "@/lib/constants";

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const showBeta = true;

  // Get page title from location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === PATHS.HOME) return "Home";
    if (path.startsWith(PATHS.KNOWLEDGE_CENTER)) return "Knowledge Center";
    if (path.startsWith(PATHS.MEMBER_DIRECTORY)) return "Member Directory";
    if (path.startsWith(PATHS.BUILD_YOUR_DECK)) return "Build Your Deck";
    if (path.startsWith(PATHS.LAB_SEARCH)) return "Lab Search";
    if (path.startsWith(PATHS.EVENTS)) return "Events";
    if (path.startsWith(PATHS.ASK)) return "Ask & Invite";
    if (path.startsWith(PATHS.ADMIN)) return "Admin Dashboard";
    if (path.startsWith(PATHS.PROFILE)) return "Profile Settings";
    if (path.startsWith(PATHS.VIDEO)) {
      const videoId = location.pathname.split("/").pop();
      return "Video Player";
    }
    return "";
  };

  const pageTitle = getPageTitle();

  if (!isAuthenticated) {
    return (
      <header className="h-16 px-6 flex items-center justify-between border-b">
        <div></div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to={PATHS.LOGIN}>Log In</Link>
          </Button>
          <Button asChild>
            <Link to={PATHS.REGISTER}>Sign Up</Link>
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 pl-[214px] pr-6 flex items-center justify-between border-b">
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      
      <div className="flex items-center gap-4">
        {showBeta && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Beta
          </span>
        )}
        
        <a href="#" className="text-gray-500 hover:text-gray-800 text-sm">
          questions/feedback
        </a>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={PATHS.PROFILE}>Profile Settings</Link>
            </DropdownMenuItem>
            {user?.isAdmin && (
              <DropdownMenuItem asChild>
                <Link to={PATHS.ADMIN}>Admin Dashboard</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
