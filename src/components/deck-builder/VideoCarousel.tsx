
import React, { useRef } from 'react';
import { Video } from "@/types";
import VideoCard from "@/components/VideoCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VideoCarouselProps {
  videos: Video[];
  slideNumbers?: string;
  moduleId?: string;
}

const VideoCarousel = ({ videos, slideNumbers, moduleId }: VideoCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-gray-800 rounded-lg">
        <p className="text-gray-400">No videos available for this section yet.</p>
      </div>
    );
  }

  // Add deck builder properties to videos if not present
  const preparedVideos = videos.map(video => ({
    ...video,
    isDeckBuilderVideo: true,
    deckBuilderSlide: slideNumbers || "",
    deckBuilderModuleId: moduleId || video.moduleId, // Use the provided moduleId
  }));

  return (
    <div className="relative">
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
      
      <ScrollArea className="w-full">
        <div 
          ref={scrollRef}
          className="flex space-x-4 pb-4 md:pb-0 overflow-x-auto"
        >
          {preparedVideos.map((video) => (
            <div key={video.id} className="w-[280px] flex-none h-full">
              <VideoCard 
                key={video.id} 
                video={video}
                moduleTitle={slideNumbers ? `Slide ${slideNumbers}` : undefined}
                isDeckBuilderView={true}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default VideoCarousel;
