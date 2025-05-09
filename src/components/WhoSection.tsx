
import React from 'react';
import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useIsMobile } from '@/hooks/use-mobile';

const features = [
  {
    title: 'Mindset',
    topText: 'Academic training often leads to slower iteration cycles compared to business.',
    bottomText: 'We help you increase iteration speed, speed means more data, in science and in business.'
  },
  {
    title: 'Unique playbook',
    topText: 'There is no one playbook for science companies.',
    bottomText: 'We help you build your own unique playbook.'
  },
  {
    title: 'Community',
    topText: 'Building a science company is a challenge of a lifetime.',
    bottomText: 'Our 300+ BSF alumni including 80 scientist founders are here to support you.'
  }
];

const WhoSection: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Section>
      <h2 className="text-3xl font-bold mb-8">Building a science company is not about IP, but it is about</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((item, index) => (
          <Card key={index} className="bg-white shadow-sm rounded-none h-full">
            <CardContent className={`${isMobile ? 'p-4' : 'p-5'} flex flex-col h-full`}>
              {/* Title */}
              <h3 className="text-xl font-bold mb-3 text-left">{item.title}</h3>
              
              {/* Content container */}
              <div className="flex flex-col flex-grow">
                {/* Top section - fixed height on desktop only */}
                <div className={isMobile ? "" : "h-[120px]"}>
                  <p className="text-zinc-600">{item.topText}</p>
                </div>
                
                {/* Divider - reduced spacing on mobile */}
                <div className={isMobile ? "py-2 my-1" : "py-4"}>
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                
                {/* Bottom section - fixed height on desktop only */}
                <div className={isMobile ? "" : "h-[120px]"}>
                  <p className="text-zinc-600">{item.bottomText}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default WhoSection;
