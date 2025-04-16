
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { PATHS } from "@/lib/constants";
import { Video } from "@/types";
import { CalendarDays, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const VideoCarousel = () => {
  const { videos, loading } = useVideos();
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  
  const [emblaRef] = useEmblaCarousel({ 
    loop: true,
    skipSnaps: false,
    containScroll: 'trimSnaps',
    dragFree: true
  }, [
    Autoplay({ delay: 4000, stopOnMouseEnter: true })
  ]);

  useEffect(() => {
    if (!loading && videos.length > 0) {
      // Get the latest 5 videos (or fewer if not available)
      const latestVideos = [...videos]
        .sort((a, b) => {
          const aDummy = a.id.includes("dummy-");
          const bDummy = b.id.includes("dummy-");
          if (aDummy && !bDummy) return 1;
          if (!aDummy && bDummy) return -1;
          return b.id.localeCompare(a.id);
        })
        .slice(0, 5);
      
      setFeaturedVideos(latestVideos);
    }
  }, [videos, loading]);

  if (loading || featuredVideos.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="animate-pulse w-16 h-16 rounded-full bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {featuredVideos.map((video, index) => (
            <div key={video.id} className="embla__slide">
              <div className="relative group w-full md:h-[400px] h-[300px] rounded-xl overflow-hidden transform transition-transform duration-500 perspective-1000">
                <Link to={`${PATHS.VIDEO}/${video.id}`} className="block h-full">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  
                  {/* Video thumbnail */}
                  <img 
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  
                  {/* Video info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {video.duration || "30:00"}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">{video.title}</h2>
                    <p className="text-white/80 mb-4 line-clamp-2 text-sm md:text-base">
                      {video.description}
                    </p>
                    
                    <Button className="gap-2" size="sm">
                      <Play className="w-4 h-4" />
                      Watch Now
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
          padding: 0 1rem;
          transform: scale(0.9) translateZ(-100px);
          transition: transform 0.4s ease;
          opacity: 0.5;
        }
        .embla__slide.is-selected {
          transform: scale(1) translateZ(0);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default VideoCarousel;
