
import { Header } from "@/components/Header";
import { WaitlistForm } from "@/components/WaitlistForm";

const SprintWaitlistPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 mt-16">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] leading-tight">
              This is the era of Scientist CEOs
            </h1>
            <p className="text-lg md:text-xl text-[#403E43] whitespace-nowrap">
              Join our 10 day sprint. <a href="#" className="text-black underline">Get $100K-$250K</a> to launch your startup.
            </p>
          </div>

          <WaitlistForm />
        </div>
      </main>

      <footer className="py-8 text-center text-[#403E43]">
        Putting Scientists First since 2020.
      </footer>
    </div>
  );
};

export default SprintWaitlistPage;
