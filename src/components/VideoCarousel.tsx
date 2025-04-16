import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { PATHS } from "@/lib/constants";
import { Video } from "@/types";
import { CalendarDays, Clock, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

const VideoCarousel = () => {
  const { videos, loading } = useVideos();
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const isMobile = useIsMobile();
  const autoplayOptions = { delay: 5000, stopOnInteraction: false };
  const autoplayRef = useRef(Autoplay(autoplayOptions));
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: 'keepSnaps',
    dragFree: true
  }, [autoplayRef.current]);

  useEffect(() => {
    if (!loading && videos.length > 0) {
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

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    if (emblaApi) {
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
    <div className="relative carousel-wrapper">
      {!isMobile && (
        <>
          <button 
            onClick={scrollPrev} 
            className="carousel-button left-2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={scrollNext} 
            className="carousel-button right-2"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="embla overflow-visible" ref={emblaRef}>
        <div className="embla__container">
          {featuredVideos.map((video) => (
            <div key={video.id} className="embla__slide">
              <div className="carousel-card">
                <Link to={`${PATHS.VIDEO}/${video.id}`} className="block h-full">
                  <div className={`absolute inset-0 ${
                    isMobile 
                      ? 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
                      : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
                  } z-10`} />
                  
                  <AspectRatio ratio={16 / 9} className="h-full">
                    <img 
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </AspectRatio>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {video.duration || "30:00"}
                      </div>
                      {!isMobile && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-white/60" />
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            {formatDistanceToNow(new Date(), { addSuffix: true })}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <h2 className={`font-bold text-white ${
                      isMobile ? 'text-lg mb-2' : 'text-2xl mb-2'
                    }`}>
                      {video.title}
                    </h2>
                    
                    {!isMobile && (
                      <>
                        <p className="text-white/80 mb-4 line-clamp-2 text-sm md:text-base">
                          {video.description}
                        </p>
                        <Button className="gap-2" size="sm">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </Button>
                      </>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .carousel-wrapper {
            position: relative;
            overflow: visible !important;
            width: 100%;
            margin: 2rem 0;
          }
          
          .carousel-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(255, 255, 255, 0.9);
            color: #333;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            z-index: 20;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          
          .carousel-button:hover {
            background-color: white;
            transform: translateY(-50%) scale(1.1);
          }
          
          .embla {
            overflow: visible !important;
            width: 100%;
            padding: 1rem 0;
            position: relative;
          }
          
          .embla__container {
            display: flex;
            perspective: 1000px;
            width: 100%;
          }
          
          .embla__slide {
            flex: 0 0 70%;
            min-width: 0;
            max-width: 800px;
            margin: 0 1rem;
            transform: rotateY(20deg) scale(0.9);
            transition: transform 0.5s ease, opacity 0.5s ease;
            opacity: 0.5;
            position: relative;
            z-index: 0;
          }
          
          .embla__slide.is-selected {
            transform: rotateY(0) scale(1);
            opacity: 1;
            z-index: 10;
          }
          
          .carousel-card {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            transform-style: preserve-3d;
            transition: all 0.3s ease;
          }
          
          @media (max-width: 768px) {
            .embla__slide {
              flex: 0 0 85%;
              margin: 0 0.5rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VideoCarousel;
