
import React from 'react';
import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const criteria = [
  {
    title: 'Profile',
    description: 'Scientists and engineers from academia\nor industry'
  },
  {
    title: 'Stage',
    description: 'With or without IP, ready to build\na world-changing venture'
  },
  {
    title: 'Execution',
    description: 'Ready to commit and build with\nspeed and determination'
  }
];

const WhoSection: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Section>
      <h2 className="text-3xl font-bold mb-10">Who is this for?</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {criteria.map((item, index) => (
          <Card key={index} className="bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-zinc-600 whitespace-pre-line">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default WhoSection;
