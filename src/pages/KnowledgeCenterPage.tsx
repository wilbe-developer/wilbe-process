
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/hooks/useVideos";
import VideoCard from "@/components/VideoCard";
import ProgressBar from "@/components/ProgressBar";
import { PATHS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ModuleSelect from "@/components/ModuleSelect";

const KnowledgeCenterPage = () => {
  const { videos, modules, loading, error } = useVideos();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "all");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Filter out deck builder modules and their videos
  const regularModules = modules.filter(m => !m.isDeckBuilderModule);
  
  // For the "all" tab, we need all videos that are either:
  // 1. Not from a deck builder module
  // 2. Also exist in a regular module
  const visibleVideos = videos.filter(video => {
    // Filter out videos that are only in deck builder modules
    const videoModule = modules.find(m => m.id === video.moduleId);
    if (!videoModule?.isDeckBuilderModule) {
      return true; // Keep videos from regular modules
    }
    
    // Check if this video also exists in a regular module
    return false; // Exclude videos that are only in deck builder modules
  });
  
  console.log("KnowledgeCenterPage rendering", { 
    isAuthenticated,
    videosCount: visibleVideos.length,
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

  if (!loading && visibleVideos.length === 0 && regularModules.length === 0) {
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
    <div className="max-w-6xl mx-auto px-4 pb-8">
      <div className="mb-8">
        <ProgressBar />
        
        <h1 className="text-3xl font-bold mb-6">Knowledge Center</h1>
        
        <p className="text-gray-700 mb-4">
          Browse all the video content on the platform here, or head over to the path-specific structured pages from the Home page.
        </p>
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
            <strong>Notice:</strong> You're viewing placeholder content. Please log in to see actual content from the database.
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <ModuleSelect 
          modules={regularModules}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="w-full">
        {activeTab === "all" ? (
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
            ) : visibleVideos.length > 0 ? (
              visibleVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  showModule={true} 
                  moduleTitle={video.moduleId ? getModuleTitleById(video.moduleId) : undefined}
                  isDeckBuilderView={false}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No videos available. Please check database or login status.</p>
              </div>
            )}
          </div>
        ) : (
          regularModules.map((module) => (
            module.id === activeTab && (
              <div key={module.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full mb-4">
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
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      moduleTitle={module.title}
                      isDeckBuilderView={false} 
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">No videos available in this module. Check module_videos associations.</p>
                  </div>
                )}
              </div>
            )
          ))
        )}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" asChild>
          <Link to={PATHS.HOME}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeCenterPage;
