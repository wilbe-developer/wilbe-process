
import { useParams, Link } from "react-router-dom";
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
import VideoCard from "@/components/VideoCard";
import { PATHS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const isMobile = useIsMobile();
  const {
    getVideoById,
    getModule,
    getVideosByModule,
    markVideoAsCompleted,
    loading,
    modules
  } = useVideos();
  const [video, setVideo] = useState(videoId ? getVideoById(videoId) : null);
  const [module, setModule] = useState(
    video ? getModule(video.moduleId) : null
  );
  const [relatedVideos, setRelatedVideos] = useState(
    module ? getVideosByModule(module.id).filter(v => v.id !== videoId) : []
  );
  const [isCompleted, setIsCompleted] = useState(video?.completed || false);

  // Update state when videoId changes
  useEffect(() => {
    if (videoId) {
      const currentVideo = getVideoById(videoId);
      setVideo(currentVideo);
      
      if (currentVideo) {
        const currentModule = getModule(currentVideo.moduleId);
        setModule(currentModule);
        
        if (currentModule) {
          setRelatedVideos(
            getVideosByModule(currentModule.id).filter(v => v.id !== videoId)
          );
        }
        
        setIsCompleted(currentVideo.completed || false);
      }
    }
  }, [videoId, getVideoById, getModule, getVideosByModule]);

  const handleCompletionToggle = () => {
    if (videoId && !isCompleted) {
      markVideoAsCompleted(videoId);
      setIsCompleted(true);
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

  const youtubeEmbedId = getYoutubeEmbedId(video.youtubeId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to={PATHS.KNOWLEDGE_CENTER}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Knowledge Center
          </Link>
        </Button>
        {!isMobile && (
          <div className="text-gray-500 text-sm">
            {module?.title && (
              <>
                or go to:{" "}
                {modules.map((m, index) => (
                  <span key={m.id}>
                    {index > 0 && " "}
                    <Link
                      to={`${PATHS.KNOWLEDGE_CENTER}?tab=${m.id}`}
                      className="text-gray-700 hover:text-brand-pink"
                    >
                      {m.title}
                    </Link>
                    {index < modules.length - 1 && " "}
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>

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
                    <CardTitle>Member Stories</CardTitle>
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
                        to={`${PATHS.VIDEO}/${relatedVideo.id}`}
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
                <CardTitle>Member Stories</CardTitle>
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
            <h2 className="text-lg font-medium">Member Stories</h2>
            <p className="text-gray-600 mb-2">
              Hear from those scientists who've done it!
            </p>
            
            <h3 className="text-sm font-medium">Videos in this list:</h3>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <div key={relatedVideo.id} className="flex items-center">
                  <Link
                    to={`${PATHS.VIDEO}/${relatedVideo.id}`}
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
