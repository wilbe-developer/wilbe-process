
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: 'keepSnaps',
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

  useEffect(() => {
    if (emblaApi) {
      // When the slide changes, update slide appearance
      const onSelect = () => {
        const slides = document.querySelectorAll('.embla__slide');
        const selectedIndex = emblaApi.selectedScrollSnap();
        
        slides.forEach((slide, i) => {
          if (i === selectedIndex) {
            slide.classList.add('is-selected');
          } else {
            slide.classList.remove('is-selected');
          }
        });
      };

      emblaApi.on('select', onSelect);
      // Call once to set initial state
      onSelect();
      
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi]);

  if (loading || featuredVideos.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="animate-pulse w-16 h-16 rounded-full bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="embla overflow-visible" ref={emblaRef}>
        <div className="embla__container">
          {featuredVideos.map((video, index) => (
            <div key={video.id} className="embla__slide">
              <div className="carousel-card">
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

      <style>
        {`
          .embla {
            margin: 0 -2rem;
            padding: 2rem;
            overflow: visible;
          }
          
          .embla__container {
            display: flex;
            perspective: 1000px;
          }
          
          .embla__slide {
            flex: 0 0 80%;
            min-width: 0;
            max-width: 800px;
            margin: 0 1rem;
            transform: rotateY(20deg) scale(0.9);
            transition: transform 0.4s ease;
            opacity: 0.5;
            position: relative;
          }
          
          .embla__slide.is-selected {
            transform: rotateY(0) scale(1);
            opacity: 1;
            z-index: 10;
          }
          
          .carousel-card {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            transform-style: preserve-3d;
            transition: all 0.3s ease;
          }
          
          @media (max-width: 768px) {
            .embla__slide {
              flex: 0 0 90%;
            }
            
            .carousel-card {
              height: 300px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VideoCarousel;
