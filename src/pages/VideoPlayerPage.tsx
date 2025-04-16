
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVideos } from "@/hooks/useVideos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PATHS } from "@/lib/constants";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DECK_BUILDER_TEMPLATE_URL = "https://www.canva.com/design/DAGIgXCPhJk/DCxXlmbcIlqQiUIOW-GWlw/view?utm_content=DAGIgXCPhJk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview";

const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    getVideoById,
    getModule,
    getVideosByModule,
    markVideoAsCompleted,
    loading,
    modules,
    videos
  } = useVideos();
  const [video, setVideo] = useState(videoId ? getVideoById(videoId) : null);
  const [module, setModule] = useState(
    video ? getModule(video.moduleId) : null
  );
  const [isCompleted, setIsCompleted] = useState(video?.completed || false);
  
  // Check if this is from the deck builder page
  const isDeckBuilderVideo = location.search.includes('deckBuilder=true') || video?.isDeckBuilderVideo;
  const deckBuilderSlide = new URLSearchParams(location.search).get('slide') || video?.deckBuilderSlide;
  
  // Get related videos based on context (deck builder or regular module)
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);

  // Update state when videoId changes
  useEffect(() => {
    if (videoId) {
      const currentVideo = getVideoById(videoId);
      setVideo(currentVideo);
      
      if (currentVideo) {
        // Get the right module
        const currentModule = getModule(currentVideo.moduleId);
        setModule(currentModule);
        
        setIsCompleted(currentVideo.completed || false);
        
        // Choose related videos based on context
        if (isDeckBuilderVideo) {
          // For deck builder, get related videos based on the slide number
          const slide = new URLSearchParams(location.search).get('slide') || currentVideo.deckBuilderSlide;
          
          if (slide) {
            // If we have a specific slide number, find videos for that slide
            let deckBuilderRelatedVideos = [];
            
            // For slide 1 (Team), show all team-related videos
            if (slide === "1") {
              // First check if we have a deck builder module for The Team
              const teamModule = modules.find(m => 
                m.isDeckBuilderModule && m.title === "The Team"
              );
              
              if (teamModule && teamModule.videos.length > 0) {
                deckBuilderRelatedVideos = teamModule.videos.filter(v => v.id !== videoId);
              } else {
                // Fallback to searching for team-related videos by title
                deckBuilderRelatedVideos = videos.filter(v => 
                  (v.title.toLowerCase().includes("two ways of doing ventures") || 
                   v.title.toLowerCase().includes("company culture and team building")) &&
                  v.id !== videoId
                );
              }
            }
            // For slides 2 & 3 (Proposition), show all proposition module videos
            else if (slide === "2 & 3") {
              // First check if we have a deck builder module for Proposition
              const propositionModule = modules.find(m => 
                m.isDeckBuilderModule && m.title === "Proposition"
              );
              
              if (propositionModule && propositionModule.videos.length > 0) {
                deckBuilderRelatedVideos = propositionModule.videos.filter(v => v.id !== videoId);
              } else {
                // Fallback to regular proposition module
                const regularPropositionModule = modules.find(m => 
                  !m.isDeckBuilderModule && (
                    m.title.toLowerCase() === "proposition" || 
                    m.slug.toLowerCase() === "proposition"
                  )
                );
                
                if (regularPropositionModule) {
                  deckBuilderRelatedVideos = videos.filter(v => 
                    v.moduleId === regularPropositionModule.id && 
                    v.id !== videoId
                  );
                }
              }
            }
            // For slides 4 & 5 (Market), show all market module videos
            else if (slide === "4 & 5") {
              // First check if we have a deck builder module for Market
              const marketModule = modules.find(m => 
                m.isDeckBuilderModule && m.title === "Market"
              );
              
              if (marketModule && marketModule.videos.length > 0) {
                deckBuilderRelatedVideos = marketModule.videos.filter(v => v.id !== videoId);
              } else {
                // Fallback to regular market module
                const regularMarketModule = modules.find(m => 
                  !m.isDeckBuilderModule && (
                    m.title.toLowerCase() === "your market" || 
                    m.slug.toLowerCase() === "your-market"
                  )
                );
                
                if (regularMarketModule) {
                  deckBuilderRelatedVideos = videos.filter(v => 
                    v.moduleId === regularMarketModule.id && 
                    v.id !== videoId
                  );
                }
              }
            }
            // For Fundraising, show all fundraising module videos
            else if (slide === "") {
              // First check if we have a deck builder module for Fundraising
              const fundraisingModule = modules.find(m => 
                m.isDeckBuilderModule && m.title === "Fundraising 101"
              );
              
              if (fundraisingModule && fundraisingModule.videos.length > 0) {
                deckBuilderRelatedVideos = fundraisingModule.videos.filter(v => v.id !== videoId);
              } else {
                // Fallback to regular fundraising module
                const regularFundraisingModule = modules.find(m => 
                  !m.isDeckBuilderModule && (
                    m.title.toLowerCase() === "fundraising 101" || 
                    m.slug.toLowerCase() === "fundraising-101"
                  )
                );
                
                if (regularFundraisingModule) {
                  deckBuilderRelatedVideos = videos.filter(v => 
                    v.moduleId === regularFundraisingModule.id && 
                    v.id !== videoId
                  );
                }
              }
            }
            
            setRelatedVideos(deckBuilderRelatedVideos);
          } else {
            // If no slide, just show other deck builder videos
            setRelatedVideos(
              videos.filter(v => v.isDeckBuilderVideo && v.id !== videoId)
            );
          }
        } else if (currentModule) {
          // For regular videos, show other videos from the same module
          setRelatedVideos(
            getVideosByModule(currentModule.id).filter(v => v.id !== videoId)
          );
        } else {
          // Fallback to empty array
          setRelatedVideos([]);
        }
      }
    }
  }, [videoId, getVideoById, getModule, getVideosByModule, location.search, isDeckBuilderVideo, videos, modules]);

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

  // Extract YouTube ID from URL if it's a full URL
  const getYoutubeEmbedId = (youtubeIdOrUrl: string) => {
    if (!youtubeIdOrUrl) return '';
    
    if (youtubeIdOrUrl.includes('youtube.com') || youtubeIdOrUrl.includes('youtu.be')) {
      const urlObj = new URL(youtubeIdOrUrl);
      if (youtubeIdOrUrl.includes('youtube.com/watch')) {
        return urlObj.searchParams.get('v') || '';
      } else if (youtubeIdOrUrl.includes('youtu.be/')) {
        return urlObj.pathname.split('/')[1] || '';
      }
    }
    
    return youtubeIdOrUrl; // Return as is if it's just an ID
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
        <Button asChild>
          <Link to={PATHS.KNOWLEDGE_CENTER}>Back to Knowledge Center</Link>
        </Button>
      </div>
    );
  }

  const youtubeEmbedId = getYoutubeEmbedId(video.youtubeId || '');
  
  // Get module title for display
  const getModuleTitle = () => {
    if (isDeckBuilderVideo) {
      if (deckBuilderSlide === "1") {
        return "The Team";
      } else if (deckBuilderSlide === "2 & 3") {
        return "Proposition";
      } else if (deckBuilderSlide === "4 & 5") {
        return "Market";
      } else {
        return "Deck Builder";
      }
    } else if (module) {
      return module.title;
    } else {
      return 'Member Stories';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> 
          {isDeckBuilderVideo ? "Build Your Deck" : "Knowledge Center"}
        </Button>
        {!isMobile && !isDeckBuilderVideo && (
          <div className="text-gray-500 text-sm">
            {module?.title && (
              <>
                or go to:{" "}
                {modules.filter(m => !m.isDeckBuilderModule).map((m, index) => (
                  <span key={m.id}>
                    {index > 0 && " "}
                    <Link
                      to={`${PATHS.KNOWLEDGE_CENTER}?tab=${m.id}`}
                      className="text-gray-700 hover:text-brand-pink"
                    >
                      {m.title}
                    </Link>
                    {index < modules.filter(m => !m.isDeckBuilderModule).length - 1 && " "}
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {isDeckBuilderVideo && (
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
              <a href={DECK_BUILDER_TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                Template <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="text-gray-500">{video.duration}</div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={handleCompletionToggle}
            />
            <Label htmlFor="completed" className="text-sm">
              I Completed This
            </Label>
          </div>

          {isMobile ? (
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="playlist">Playlist</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {getModuleTitle()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{video.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://creativecommons.org/images/deed/cc-logo.jpg"
                        alt="Creative Commons License"
                        className="h-4"
                      />
                      <span className="text-gray-500 text-xs">
                        BY-NC-SA 4.0 LICENSE
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm">{video.duration}</div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="questions" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">Watch this video and complete the questions.</p>
                    <div className="mt-6">
                      <Button className="bg-pink-600 hover:bg-pink-700">
                        Go to Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="playlist" className="py-4">
                <h3 className="text-sm font-medium mb-3">Videos in this list:</h3>
                <div className="space-y-4">
                  {relatedVideos.map((relatedVideo) => (
                    <div key={relatedVideo.id} className="flex items-center">
                      <Link
                        to={`${PATHS.VIDEO}/${relatedVideo.id}${isDeckBuilderVideo ? '?deckBuilder=true' : ''}${deckBuilderSlide ? `&slide=${deckBuilderSlide}` : ''}`}
                        className="flex items-center hover:bg-gray-50 p-2 rounded-md w-full"
                      >
                        <div className="flex-shrink-0 relative">
                          <img
                            src={relatedVideo.thumbnailUrl || "/placeholder.svg"}
                            alt={relatedVideo.title}
                            className="w-24 h-16 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                            {relatedVideo.duration}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {relatedVideo.duration}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getModuleTitle()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{video.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://creativecommons.org/images/deed/cc-logo.jpg"
                    alt="Creative Commons License"
                    className="h-4"
                  />
                  <span className="text-gray-500 text-xs">
                    BY-NC-SA 4.0 LICENSE
                  </span>
                </div>
                <div className="text-gray-500 text-sm">{video.duration}</div>
              </CardFooter>
            </Card>
          )}
        </div>

        {!isMobile && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              {isDeckBuilderVideo 
                ? deckBuilderSlide 
                  ? `Slide ${deckBuilderSlide} Videos` 
                  : 'Deck Builder Videos'
                : getModuleTitle()}
            </h2>
            <p className="text-gray-600 mb-2">
              {isDeckBuilderVideo 
                ? 'Videos to help you build your pitch deck'
                : 'Hear from those scientists who\'ve done it!'}
            </p>
            
            <h3 className="text-sm font-medium">Videos in this list:</h3>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <div key={relatedVideo.id} className="flex items-center">
                  <Link
                    to={`${PATHS.VIDEO}/${relatedVideo.id}${isDeckBuilderVideo ? '?deckBuilder=true' : ''}${deckBuilderSlide ? `&slide=${deckBuilderSlide}` : ''}`}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md w-full"
                  >
                    <div className="flex-shrink-0 relative">
                      <img
                        src={relatedVideo.thumbnailUrl || "/placeholder.svg"}
                        alt={relatedVideo.title}
                        className="w-24 h-16 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {relatedVideo.duration}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium line-clamp-2">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {relatedVideo.duration}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPage;
