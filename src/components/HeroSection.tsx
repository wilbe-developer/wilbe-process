
import React from 'react';
import Section from './Section';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist-form');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Section 
      className="py-20 md:py-32 bg-gradient-to-b from-orange-500 via-orange-300 to-white text-white"
      withContainer={true}
    >
      <div className="text-center space-y-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight max-w-7xl mx-auto">
          Bring your science to the world.<br />
          Build the company only you can.
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
          Go from scientist to founder in 10 days. Unlock all our templates, guidance and the clarity to 
          make critical decisions. Put together your most investable venture plan and tell us how much 
          you need to make it happen. Stand out, and you'll get your first $100K-250K investment from 
          us, and join a world-class community of scientist-founders.
        </p>
        <div className="pt-4">
          <Button 
            onClick={scrollToWaitlist}
            className="bg-white text-orange-500 hover:bg-white/90 text-lg px-6 py-6 h-auto"
          >
            Join the waitlist
            <ArrowRight />
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default HeroSection;
