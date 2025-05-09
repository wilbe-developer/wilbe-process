
import React from 'react';
import Section from './Section';

const focusAreas = [
  {
    title: 'Mindset',
    description: 'Transition from academic thinking to entrepreneurial execution. We guide you to build with long-term impact in mind.'
  },
  {
    title: 'Customers',
    description: 'Learn to engage with customers effectively. We help you initiate conversations that lead to meaningful insights and traction.'
  },
  {
    title: 'Operations',
    description: 'Establish a solid foundation for your venture. From financial structuring to strategic hiring and IP management, we assist you in setting up for scalable growth.'
  },
  {
    title: 'Fundraising',
    description: 'Navigate the funding landscape with confidence. We support you in identifying the right investors and securing the capital to advance your mission.'
  }
];

const FocusSection: React.FC = () => {
  return (
    <Section>
      <h2 className="text-3xl font-bold mb-10">What does BSF focus on?</h2>
      <div className="space-y-6">
        {focusAreas.map((area, index) => (
          <div key={index} className="border-b border-zinc-200 pb-6 last:border-b-0">
            <h3 className="text-xl font-bold mb-1">{area.title}</h3>
            <p className="text-zinc-600">{area.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default FocusSection;
