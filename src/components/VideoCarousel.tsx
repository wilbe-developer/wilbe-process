
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

const VideoCarousel = () => {
  const { videos, loading } = useVideos();
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!loading && videos.length > 0) {
      // Get the latest 5 videos (or fewer if not available)
      const latestVideos = [...videos]
        .sort((a, b) => {
          // First, prioritize non-dummy videos
          const aDummy = a.id.includes("dummy-");
          const bDummy = b.id.includes("dummy-");
          if (aDummy && !bDummy) return 1;
          if (!aDummy && bDummy) return -1;
          
          // Then sort by ID (as a proxy for recency)
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
    <div className="relative">
      <Carousel className="w-full" opts={{ loop: true, align: "center" }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {featuredVideos.map((video, index) => (
            <CarouselItem 
              key={video.id} 
              className="pl-2 md:pl-4 md:basis-4/5 lg:basis-2/3" 
            >
              <div className="relative group w-full h-[400px] rounded-xl overflow-hidden">
                <Link to={`${PATHS.VIDEO}/${video.id}`}>
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                  
                  {/* Video thumbnail */}
                  <img 
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
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
                      <div className="w-1 h-1 rounded-full bg-white/60"></div>
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">{video.title}</h2>
                    <p className="text-white/80 mb-4 line-clamp-2">{video.description}</p>
                    
                    <Button className="gap-2" size="sm">
                      <Play className="w-4 h-4" />
                      Watch Now
                    </Button>
                  </div>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};

export default VideoCarousel;
