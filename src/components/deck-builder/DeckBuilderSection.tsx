
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Video } from "@/types";
import { PATHS } from "@/lib/constants";
import VideoCard from "@/components/VideoCard";

interface DeckBuilderSectionProps {
  title: string;
  subtitle: string;
  description: string;
  videos: Video[];
  slideNumbers?: string;
  templateUrl?: string;
}

const DeckBuilderSection = ({
  title,
  subtitle,
  description,
  videos,
  slideNumbers,
  templateUrl = "https://www.canva.com/design/DAGIgXCPhJk/DCxXlmbcIlqQiUIOW-GWlw/view?utm_content=DAGIgXCPhJk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
}: DeckBuilderSectionProps) => {
  return (
    <div className="bg-brand-darkBlue rounded-lg p-6 md:p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderSection;
