
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Video } from "@/types";
import { PATHS } from "@/lib/constants";
import VideoCard from "@/components/VideoCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Add deck builder properties to videos if not present
  const preparedVideos = videos.map(video => ({
    ...video,
    isDeckBuilderVideo: true,
    deckBuilderSlide: slideNumbers || "",
  }));

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
        
        <div className="lg:col-span-2 relative">
          {preparedVideos.length > 0 ? (
            <>
              {preparedVideos.length > 2 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 rounded-full hidden md:flex"
                    onClick={() => handleScroll('left')}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 rounded-full hidden md:flex"
                    onClick={() => handleScroll('right')}
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
              
              <div className="relative">
                <ScrollArea className="w-full">
                  <div 
                    ref={scrollRef}
                    className="flex space-x-4 pb-4 md:pb-0 overflow-x-auto"
                  >
                    {preparedVideos.map((video) => (
                      <div key={video.id} className="w-[280px] flex-none h-full">
                        <VideoCard 
                          key={video.id} 
                          video={{
                            ...video,
                            isDeckBuilderVideo: true,
                            deckBuilderSlide: slideNumbers,
                            deckBuilderModuleId: title.toLowerCase().replace(/\s+/g, '-')
                          }} 
                          moduleTitle={title}
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] bg-gray-800 rounded-lg">
              <p className="text-gray-400">No videos available for this section yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderSection;
