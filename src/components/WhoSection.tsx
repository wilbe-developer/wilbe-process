
import React from 'react';
import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    title: 'Mindset',
    topText: 'Academic training forces much slower iteration than in business',
    bottomText: 'We help you increase iteration speed, speed means more data, in science and in business.'
  },
  {
    title: 'Unique playbook',
    topText: 'There is no one playbook for science companies.',
    bottomText: 'We help you build your own unique playbook.'
  },
  {
    title: 'Supportive community',
    topText: 'Building a science company is a challenge of a lifetime.',
    bottomText: 'Our 300+ BSF alumni including 80 scientist founders are here to support you.'
  }
];

const WhoSection: React.FC = () => {
  return (
    <Section>
      <h2 className="text-3xl font-bold mb-10">Building a science company is not about IP, but it is about</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((item, index) => (
          <Card key={index} className="bg-white shadow-sm rounded-none">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-bold mb-4 text-left">{item.title}</h3>
              <div className="flex-grow flex flex-col justify-between">
                <p className="text-zinc-600 h-[72px]">{item.topText}</p>
                <div className="border-t border-zinc-200 my-4"></div>
                <p className="text-zinc-600 h-[96px]">{item.bottomText}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default WhoSection;
