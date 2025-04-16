
import React from 'react';
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  description: string;
  slideNumbers?: string;
  templateUrl: string;
}

const SectionHeader = ({
  title,
  subtitle,
  description,
  slideNumbers,
  templateUrl
}: SectionHeaderProps) => {
  return (
    <div className="lg:col-span-1">
      {slideNumbers && (
        <div className="text-brand-pink font-medium mb-2">{slideNumbers}</div>
      )}
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <h3 className="text-xl text-gray-300 mb-4">{subtitle}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <div className="space-y-4">
        <Button 
          asChild
          className="w-full md:w-auto bg-brand-pink hover:bg-brand-pink/90"
        >
          <a href={templateUrl} target="_blank" rel="noopener noreferrer">
            Template
          </a>
        </Button>
        <div className="text-sm text-gray-400">
          Watch first, then update {slideNumbers ? `slide${slideNumbers.includes('&') ? 's' : ''} ${slideNumbers}` : 'the slides'}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
