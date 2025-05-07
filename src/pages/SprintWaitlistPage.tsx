
import { Header } from "@/components/Header";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Helmet } from "react-helmet";

const SprintWaitlistPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 mt-8 md:mt-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1F2C] leading-tight px-2">
              Scientists you are now free to build at speed. With or without IP.
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-[#403E43] px-2">
              In 10 days unlock all our templates, guidance and community of scientist founders. Put together your most investible venture plan and tell us how much you need to make it happen. Stand out and we can invest up to $250k. Worst case you have a plan.
            </p>
          </div>

          <WaitlistForm />
        </div>
      </main>

      <footer className="py-6 md:py-8 text-center text-[#403E43]">
        Putting Scientists First since 2020.
      </footer>
    </div>
  );
};

export default SprintWaitlistPage;
