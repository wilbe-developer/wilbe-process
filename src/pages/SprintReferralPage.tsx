
import { useLocation, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

const SprintReferralPage = () => {
  const { state } = useLocation();
  const { toast } = useToast();
  
  if (!state?.referralLink) {
    return <Navigate to="/sprint-waitlist" replace />;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(state.referralLink);
    toast({
      title: "Link copied!",
      description: "Share it with other builders to gain early access.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1F2C] mb-4">
              We'll email you when the sprint is ready - prepare.
            </h1>
            <p className="text-xl text-[#403E43]">
              Share with 3 other builders to gain early access
            </p>
          </div>
          
          <div className="flex w-full items-center space-x-2">
            <Input
              readOnly
              value={state.referralLink}
              className="h-12 rounded-none"
            />
            <Button 
              onClick={handleCopyLink} 
              className="h-12 rounded-none"
              style={{ backgroundColor: '#ff0052' }}
            >
              Copy
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-600">
        Putting Scientists First since 2020.
      </footer>
    </div>
  );
};

export default SprintReferralPage;
