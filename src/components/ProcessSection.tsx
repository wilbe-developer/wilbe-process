
import React from 'react';
import Section from './Section';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

const steps = [
  {
    number: 1,
    title: 'Sign-up - it\'s free, it\'s rolling',
    description: "Fill out the application form to help us\nchart the best journey for you based on your sector,\nchallenges and stage of development."
  },
  {
    number: 2,
    title: '10 days to show us your best',
    description: 'In our online process, you can move at your own pace\nto build the foundations. But, complete it in 10 days\nand you get our attention as investors.'
  },
  {
    number: 3,
    title: 'Become a Wilbe Founder',
    description: 'If it\'s a fit, we invest up to $250K and\npartner with you to unlock the next stage.'
  },
  {
    number: 4,
    title: 'Join the community of scientist leaders',
    description: "You will be invited to join us at an\nin-person residency where we chart the future steps\nalongside fellow Wilbe founders."
  }
];

const ProcessSection: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Special formatting for mobile view of the first step
  const getFormattedDescription = (index: number, desc: string) => {
    if (isMobile && index === 0) {
      return "Fill out the application form\nto help us\nchart the best journey for you.";
    }
    return desc;
  };

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist-form');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Section className="bg-white">
      <h2 className="text-3xl font-bold mb-10">Your journey to Become a Scientist Founder (BSF)</h2>
      <div className="space-y-8 mb-10">
        {steps.map((step, index) => (
          <div key={step.number} className="flex border-b border-zinc-200 pb-6 last:border-b-0">
            <div className="mr-6 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                {step.number}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{step.title}</h3>
              <p className="text-zinc-600 whitespace-pre-line">
                {getFormattedDescription(index, step.description)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Button 
          onClick={scrollToWaitlist}
          className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-6 py-2 h-auto rounded-none"
        >
          Join the waitlist
          <ArrowRight />
        </Button>
      </div>
    </Section>
  );
};

export default ProcessSection;
