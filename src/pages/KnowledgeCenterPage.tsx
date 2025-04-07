
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideos } from "@/hooks/useVideos";
import VideoCard from "@/components/VideoCard";
import ProgressBar from "@/components/ProgressBar";
import { PATHS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const KnowledgeCenterPage = () => {
  const { videos, modules, loading, error } = useVideos();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "all");
  const { toast } = useToast();
  
  console.log("KnowledgeCenterPage rendering", { 
    videosCount: videos.length,
    modulesCount: modules.length,
    loading,
    error
  });

  // Update active tab when the URL param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Show toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading content",
        description: error
      });
    }
  }, [error, toast]);

  // Show empty state if no videos are found after loading
  if (!loading && videos.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No videos found</h2>
        <p className="mb-6">There are currently no videos available in the knowledge center.</p>
        <Button asChild>
          <Link to={PATHS.HOME}>Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ProgressBar />
      
      <div className="mb-8">
        <p className="text-gray-700">
          Browse all the video content on the platform here, or head over to the path-specific structured pages from the Home page.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Videos</TabsTrigger>
          {modules.map((module) => (
            <TabsTrigger key={module.id} value={module.id}>
              {module.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
              ))
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard key={video.id} video={video} showModule={true} />
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No videos available</p>
            </div>
          )}
        </TabsContent>
        
        {modules.map((module) => (
          <TabsContent
            key={module.id}
            value={module.id}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-3 mb-2">
              <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
              <p className="text-gray-600">{module.description}</p>
            </div>
            
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="w-full aspect-video rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                  </div>
                ))
            ) : module.videos.length > 0 ? (
              module.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No videos available in this module</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to={PATHS.HOME}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeCenterPage;
