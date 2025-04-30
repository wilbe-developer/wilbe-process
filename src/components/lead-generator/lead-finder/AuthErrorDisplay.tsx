
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface AuthErrorDisplayProps {
  authError: string | null;
  refreshData: () => void;
  isRecovering: boolean;
}

export const AuthErrorDisplay = ({ 
  authError, 
  refreshData, 
  isRecovering 
}: AuthErrorDisplayProps) => {
  if (!authError) return null;
  
  return (
    <Alert variant="destructive">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Authentication Required</AlertTitle>
      <AlertDescription>
        {authError}
        <div className="mt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshData} 
            className="gap-2"
            disabled={isRecovering}
          >
            {isRecovering ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AuthErrorDisplay;
