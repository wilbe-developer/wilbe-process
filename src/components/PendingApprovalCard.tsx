
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const PendingApprovalCard = () => {
  const { logout } = useAuth();
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Your Account Is Pending Approval</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 mb-4">
          <p>
            You will receive a confirmation email, this could be there waiting for you now but please allow a couple of hours. We are admitting members on a rolling basis.
          </p>
        </div>
        <p>
          You may unsubscribe using the link at the bottom of email newsletters or contact us anytime if you'd like us to delete your personal information.
        </p>
        <div className="pt-4 space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link to={PATHS.LOGIN}>Return to Login</Link>
          </Button>
          <Button onClick={logout} variant="ghost" className="w-full">
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalCard;
