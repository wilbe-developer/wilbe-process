
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
import { useAuth } from "@/hooks/useAuth";

const KnowledgeCenterPage = () => {
  const { videos, modules, loading, error } = useVideos();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "all");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Filter out deck builder modules for Knowledge Center, let's go!
  const regularModules = modules.filter(m => !m.isDeckBuilderModule);
  // Filter out videos that belong to deck builder modules
  const regularVideos = videos.filter(v => {
    const videoModule = modules.find(m => m.id === v.moduleId);
    return !videoModule?.isDeckBuilderModule;
  });
  
  console.log("KnowledgeCenterPage rendering", { 
    isAuthenticated,
    videosCount: regularVideos.length,
    modulesCount: regularModules.length,
    loading,
    error,
    modules: regularModules.map(m => ({ id: m.id, title: m.title, videoCount: m.videos?.length || 0 }))
  });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading content",
        description: error
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast({
        title: "Not authenticated",
        description: "You're viewing placeholder content. Please log in to see real data.",
        duration: 5000
      });
    }
  }, [isAuthenticated, loading, toast]);

  const getModuleTitleById = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.title : moduleId;
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please log in to view the actual Knowledge Center content from Supabase.</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link to={PATHS.LOGIN}>Log In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={PATHS.HOME}>Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && videos.length === 0 && modules.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No videos found</h1>
        <p className="mb-6">There are currently no videos available in the knowledge center or you may need to log in.</p>
        <Button asChild>
          <Link to={PATHS.HOME}>Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <ProgressBar />
      
      <h1 className="text-3xl font-bold mb-6">Knowledge Center</h1>
      
      <div className="mb-8">
        <p className="text-gray-700">
          Browse all the video content on the platform here, or head over to the path-specific structured pages from the Home page.
        </p>
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
            <strong>Notice:</strong> You're viewing placeholder content. Please log in to see actual content from the database.
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative w-full overflow-x-auto mb-6 pb-1 no-scrollbar">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="all">All Videos</TabsTrigger>
            {regularModules.map((module) => (
              <TabsTrigger 
                key={module.id} 
                value={module.id}
              >
                {module.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <div className="w-full overflow-hidden">
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ) : regularVideos.length > 0 ? (
                regularVideos.map((video) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    showModule={true} 
                    moduleTitle={video.moduleId ? getModuleTitleById(video.moduleId) : undefined}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No videos available. Please check database or login status.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {regularModules.map((module) => (
            <TabsContent key={module.id} value={module.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                ) : module.videos && module.videos.length > 0 ? (
                  module.videos.map((video) => (
                    <VideoCard key={video.id} video={video} moduleTitle={module.title} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">No videos available in this module. Check module_videos associations.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      
      <div className="flex justify-center mb-8">
        <Button variant="outline" asChild>
          <Link to={PATHS.HOME}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeCenterPage;
