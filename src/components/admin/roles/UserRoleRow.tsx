
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile, UserRole } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserRoleRowProps {
  user: UserProfile;
  userRoles: UserRole[];
  onRoleToggle: (userId: string, role: UserRole, hasRole: boolean) => Promise<void>;
}

const UserRoleRow = ({ user, userRoles, onRoleToggle }: UserRoleRowProps) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const isAdmin = userRoles.includes("admin");
  const isMember = userRoles.includes("user"); // 'user' role in DB = 'Member' in UI

  const handleRoleToggle = async (role: UserRole, hasRole: boolean) => {
    setIsLoading(prev => ({ ...prev, [role]: true }));
    try {
      await onRoleToggle(user.id, role, hasRole);
    } finally {
      setIsLoading(prev => ({ ...prev, [role]: false }));
    }
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle">
        <div className="flex items-center">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </td>
      <td className="p-4 align-middle">{user.email}</td>
      <td className="p-4 align-middle">
        <div className="flex flex-wrap gap-1">
          {userRoles.map(role => (
            <Badge key={role} variant="outline" className="capitalize">
              {/* Display "Member" in the UI instead of "user" */}
              {role === "user" ? "Member" : role}
            </Badge>
          ))}
          {userRoles.length === 0 && (
            <span className="text-gray-500 text-sm">No roles</span>
          )}
        </div>
      </td>
      <td className="p-4 align-middle">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant={isAdmin ? "destructive" : "outline"}
                  onClick={() => handleRoleToggle("admin", isAdmin)}
                  disabled={isLoading["admin"]}
                >
                  {isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAdmin 
                  ? "Remove administrator privileges" 
                  : "Grant administrator privileges to this user"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant={isMember ? "destructive" : "outline"}
                  onClick={() => handleRoleToggle("user", isMember)}
                  disabled={isLoading["user"]}
                >
                  {isMember ? "Revoke Access" : "Approve Member"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMember 
                  ? "Revoke access to members-only content" 
                  : "Grant access to members-only content"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
};

export default UserRoleRow;
