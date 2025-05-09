
import React from 'react';
import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Section>
      <h2 className="text-3xl font-bold mb-8">Building a science company is not about IP, but it is about</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((item, index) => (
          <Card key={index} className="bg-white shadow-sm rounded-none">
            <CardContent className="p-5 flex flex-col h-full">
              <h3 className="text-xl font-bold mb-3 text-left">{item.title}</h3>
              <div className="flex-grow flex flex-col justify-between">
                <div className="min-h-[65px] mb-6">
                  <p className="text-zinc-600">{item.topText}</p>
                </div>
                <div>
                  <div className="w-full border-t border-zinc-200 my-6"></div>
                  <div className="min-h-[75px] mt-6">
                    <p className="text-zinc-600">{item.bottomText}</p>
                  </div>
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
