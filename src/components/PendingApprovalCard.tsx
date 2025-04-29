
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import Logo from "./Logo";

interface PendingApprovalCardProps {
  userEmail?: string;
  pendingReason?: "membership" | "verification";
}

const PendingApprovalCard = ({ userEmail, pendingReason = "verification" }: PendingApprovalCardProps) => {
  const isWaitingForMembership = pendingReason === "membership";
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl">
          {isWaitingForMembership 
            ? "Membership Pending Approval" 
            : "Email Verification Pending"}
        </CardTitle>
        <CardDescription>
          {isWaitingForMembership
            ? "Your account is pending approval by our team."
            : "Please check your email to verify your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800">
          <div className="flex items-start">
            <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {isWaitingForMembership 
                  ? "Thank you for registering!" 
                  : "Verification email sent"}
              </p>
              <p className="mt-1 text-sm">
                {isWaitingForMembership
                  ? "Your application is being reviewed. You'll receive an email when your account is approved."
                  : `We've sent a verification email to ${userEmail || "your email address"}. Please check your inbox and spam folder.`}
              </p>
            </div>
          </div>
        </div>
        
        {!isWaitingForMembership && (
          <div className="text-center">
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
            </Button>
          </div>
        )}
        
        {isWaitingForMembership && (
          <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-1">While you wait:</p>
            <p className="mb-2">You still have access to our Founder Sprint program to help you get started with your science startup journey.</p>
            <Button asChild className="w-full">
              <Link to={PATHS.SPRINT}>
                Go to Sprint Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        <p>
          Need help? Contact <a href="mailto:support@wilbe.com" className="text-brand-pink hover:underline">support@wilbe.com</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default PendingApprovalCard;
