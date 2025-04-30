
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ConnectionErrorDisplayProps {
  connectionError: string | null;
  refreshData: () => void;
}

export const ConnectionErrorDisplay = ({ 
  connectionError, 
  refreshData 
}: ConnectionErrorDisplayProps) => {
  if (!connectionError) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        {connectionError}
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionErrorDisplay;
