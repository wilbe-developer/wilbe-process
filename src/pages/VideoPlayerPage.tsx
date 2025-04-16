
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVideos } from "@/hooks/useVideos";
import { PATHS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { getYoutubeEmbedId, getModuleTitle, DECK_BUILDER_TEMPLATE_URL } from "@/utils/videoPlayerUtils";

// Component imports
import VideoHeader from "@/components/video-player/VideoHeader";
import DeckBuilderBanner from "@/components/video-player/DeckBuilderBanner";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import VideoInfo from "@/components/video-player/VideoInfo";
import VideoRelatedList from "@/components/video-player/VideoRelatedList";
import VideoMobileTabs from "@/components/video-player/VideoMobileTabs";

const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    getVideoById,
    getModule,
    markVideoAsCompleted,
    loading,
    modules,
    videos
  } = useVideos();
  
  const [video, setVideo] = useState(videoId ? getVideoById(videoId) : null);
  const [module, setModule] = useState(video ? getModule(video.moduleId) : null);
  const [isCompleted, setIsCompleted] = useState(video?.completed || false);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  
  const isDeckBuilderVideo = location.search.includes('deckBuilder=true') || video?.isDeckBuilderVideo;
  const deckBuilderSlide = new URLSearchParams(location.search).get('slide') || video?.deckBuilderSlide;

  useEffect(() => {
    if (videoId) {
      const currentVideo = getVideoById(videoId);
      setVideo(currentVideo);
      
      if (currentVideo) {
        const currentModule = getModule(currentVideo.moduleId);
        setModule(currentModule);
        setIsCompleted(currentVideo.completed || false);
        
        // Find related videos
        if (isDeckBuilderVideo) {
          const deckBuilderModuleId = currentVideo.deckBuilderModuleId || currentVideo.moduleId;
          const deckBuilderModule = modules.find(m => m.id === deckBuilderModuleId);
          
          if (deckBuilderModule && deckBuilderModule.videos) {
            const moduleVideos = deckBuilderModule.videos.filter(v => v.id !== videoId);
            setRelatedVideos(moduleVideos);
            console.log(`Found ${moduleVideos.length} related videos from deck builder module ${deckBuilderModule.title}`);
          } else if (deckBuilderSlide) {
            let deckBuilderModuleBySlide;
            
            if (deckBuilderSlide === "1") {
              deckBuilderModuleBySlide = modules.find(m => m.isDeckBuilderModule && m.slug === "the-team");
            } else if (deckBuilderSlide === "2 & 3") {
              deckBuilderModuleBySlide = modules.find(m => m.isDeckBuilderModule && m.slug === "mvd-proposition");
            } else if (deckBuilderSlide === "4 & 5") {
              deckBuilderModuleBySlide = modules.find(m => m.isDeckBuilderModule && m.slug === "mvd-market");
            }
            
            if (deckBuilderModuleBySlide && deckBuilderModuleBySlide.videos) {
              const moduleVideos = deckBuilderModuleBySlide.videos.filter(v => v.id !== videoId);
              setRelatedVideos(moduleVideos);
              console.log(`Found ${moduleVideos.length} related videos from deck builder module by slide: ${deckBuilderModuleBySlide.title}`);
            } else {
              const allDeckBuilderModules = modules.filter(m => m.isDeckBuilderModule);
              const deckBuilderVideos = allDeckBuilderModules.flatMap(m => m.videos || []).filter(v => v && v.id !== videoId);
              setRelatedVideos(deckBuilderVideos.slice(0, 5));
            }
          } else {
            setRelatedVideos([]);
          }
        } else if (currentModule) {
          setRelatedVideos(
            (currentModule.videos || []).filter(v => v.id !== videoId)
          );
        } else {
          setRelatedVideos([]);
        }
      }
    }
  }, [videoId, getVideoById, getModule, location.search, isDeckBuilderVideo, videos, modules]);

  const handleCompletionToggle = () => {
    if (videoId && !isCompleted) {
      markVideoAsCompleted(videoId);
      setIsCompleted(true);
    }
  };

  const handleBackClick = () => {
    if (isDeckBuilderVideo) {
      navigate(PATHS.BUILD_YOUR_DECK);
    } else {
      navigate(PATHS.KNOWLEDGE_CENTER);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-[450px] bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <p className="mb-6">The video you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(PATHS.KNOWLEDGE_CENTER)}
          className="px-4 py-2 bg-brand-pink text-white rounded hover:bg-brand-pink/90"
        >
          Back to Knowledge Center
        </button>
      </div>
    );
  }

  const youtubeEmbedId = getYoutubeEmbedId(video?.youtubeId || '');
  const moduleTitle = getModuleTitle(
    isDeckBuilderVideo, 
    deckBuilderSlide, 
    video.deckBuilderModuleId, 
    module?.title,
    modules
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with back navigation */}
      <VideoHeader 
        handleBackClick={handleBackClick}
        isDeckBuilderVideo={isDeckBuilderVideo}
        isMobile={isMobile}
        module={module}
        modules={modules}
      />

      {/* Display deck builder banner if applicable */}
      {isDeckBuilderVideo && (
        <DeckBuilderBanner 
          deckBuilderSlide={deckBuilderSlide} 
          templateUrl={DECK_BUILDER_TEMPLATE_URL} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Video player */}
          <VideoEmbed youtubeEmbedId={youtubeEmbedId} title={video.title} />

          {/* Video info section */}
          {isMobile ? (
            <VideoMobileTabs 
              description={video.description || ""}
              duration={video.duration || ""}
              moduleTitle={moduleTitle}
              relatedVideos={relatedVideos}
              isDeckBuilderVideo={isDeckBuilderVideo}
              deckBuilderSlide={deckBuilderSlide}
            />
          ) : (
            <VideoInfo 
              title={video.title}
              duration={video.duration || ""}
              description={video.description || "No description available"}
              moduleTitle={moduleTitle}
              isCompleted={isCompleted}
              onCompletionToggle={handleCompletionToggle}
            />
          )}
        </div>

        {/* Related videos section - desktop only */}
        {!isMobile && (
          <div className="space-y-4">
            <VideoRelatedList 
              relatedVideos={relatedVideos}
              isDeckBuilderVideo={isDeckBuilderVideo}
              deckBuilderSlide={deckBuilderSlide}
              title={isDeckBuilderVideo 
                ? deckBuilderSlide 
                  ? `Slide ${deckBuilderSlide} Videos` 
                  : 'Deck Builder Videos'
                : moduleTitle}
              subtitle={isDeckBuilderVideo 
                ? 'Videos to help you build your pitch deck'
                : 'Hear from those scientists who\'ve done it!'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPage;
