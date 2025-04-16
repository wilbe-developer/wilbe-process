
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DeckBuilderBannerProps {
  deckBuilderSlide?: string | null;
  templateUrl: string;
}

const DeckBuilderBanner = ({ 
  deckBuilderSlide, 
  templateUrl 
}: DeckBuilderBannerProps) => {
  return (
    <div className="mb-4 p-4 bg-brand-darkBlue text-white rounded-md">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="font-medium">Minimum Viable Deck</h3>
          {deckBuilderSlide && (
            <p className="text-sm text-gray-300">Use this video to help with slide {deckBuilderSlide}</p>
          )}
        </div>
        <Button 
          asChild
          className="bg-brand-pink hover:bg-brand-pink/90"
        >
          <a href={templateUrl} target="_blank" rel="noopener noreferrer">
            Template <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default DeckBuilderBanner;
