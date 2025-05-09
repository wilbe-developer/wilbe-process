
import React from 'react';
import Section from './Section';

const stats = [
  {
    value: "$2.5M",
    label: "Average pre-seed raised size",
    sublabel: "in first year"
  },
  {
    value: "4 months",
    label: "Average time-to-close",
    sublabel: "pre-seed"
  },
  {
    value: "2.5%",
    label: "Average equity",
    sublabel: "transferred to TTO"
  }
];

const AboutSection: React.FC = () => {
  return (
    <Section className="bg-orange-500 text-white">
      <h2 className="text-3xl font-bold mb-6">About Wilbe</h2>
      <div className="space-y-4 mb-10">
        <p className="text-lg">
          Since 2020, we've been equipping scientists with the tools to build ventures that matter—through business know-how, community, capital, and lab space.
        </p>
        <p className="text-lg">
          Today, our portfolio spans 20 investments with a combined valuation of $650M, and we're proud to support the world's largest network of entrepreneurial scientists—across academia, startups, and industry.
        </p>
        <p className="text-lg">
          Curious? Learn more at <a href="https://wilbe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">wilbe.com</a>.
        </p>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/30">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-white/90">{stat.label}</p>
            <p className="text-sm text-white/90">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default AboutSection;
