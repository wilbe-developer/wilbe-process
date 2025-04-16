
import { useState, useEffect } from "react";
import { Video, Module } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  formatVideosFromSupabase,
  updateVideoCompletionStatus,
  formatModulesFromSupabase,
  createDummyData
} from "@/utils/videoUtils";
import {
  fetchModules,
  fetchVideos,
  fetchModuleVideos,
  fetchVideoProgress,
  markVideoCompleted
} from "@/services/videoService";

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching videos and modules data...");
        
        // First check authentication status
        const { data: session } = await supabase.auth.getSession();
        const isAuthenticated = !!session?.session?.user;
        
        if (!isAuthenticated) {
          console.log("No authenticated user found, falling back to dummy data");
          const { dummyVideos, dummyModules } = createDummyData();
          
          console.log("Using dummy data:", { 
            videosCount: dummyVideos.length,
            modulesCount: dummyModules.length 
          });
          
          setVideos(dummyVideos);
          setModules(dummyModules);
          setIsUsingDummyData(true);
          setLoading(false);
          return;
        }
        
        console.log("User is authenticated:", session.session.user.id);
        
        // Fetch all data from Supabase
        const [modulesData, videosData, moduleVideosData] = await Promise.all([
          fetchModules(),
          fetchVideos(),
          fetchModuleVideos()
        ]);
        
        console.log("Raw modules data from Supabase:", modulesData);
        console.log("Raw videos data from Supabase:", videosData);
        console.log("Raw module_videos data from Supabase:", moduleVideosData);
        
        if (!videosData || videosData.length === 0) {
          console.warn("No videos found in database. Check your data, RLS policies, or video status.");
        }
        
        if (!moduleVideosData || moduleVideosData.length === 0) {
          console.warn("No module_videos associations found. Videos won't be connected to modules.");
        }
        
        // Format videos to match our Video type
        const formattedVideos = formatVideosFromSupabase(videosData);
        console.log("Formatted videos:", formattedVideos);
        
        // Fetch user's video progress if authenticated
        let progressData: any[] = [];
        if (session?.session?.user) {
          progressData = await fetchVideoProgress(session.session.user.id);
          console.log("Fetched video progress:", progressData.length, "records");
        }
        
        // Update video completion status based on progress data
        const videosWithProgress = updateVideoCompletionStatus(formattedVideos, progressData);
        
        // Format modules to match our Module type
        const formattedModules = formatModulesFromSupabase(
          modulesData,
          moduleVideosData,
          videosWithProgress
        );
        
        // Create a flat list of videos from all modules for the main videos array
        const allVideos = formattedModules.flatMap(module => module.videos || []);
        console.log("Final processed videos:", allVideos);
        
        if (allVideos.length === 0 && formattedModules.length === 0) {
          console.warn("No data found in Supabase, falling back to dummy data");
          const { dummyVideos, dummyModules } = createDummyData();
          
          setVideos(dummyVideos);
          setModules(dummyModules);
          setIsUsingDummyData(true);
        } else {
          setVideos(allVideos);
          setModules(formattedModules);
          setIsUsingDummyData(false);
        }
      } catch (err: any) {
        console.error("Error in useVideos hook:", err);
        setError(`Failed to load videos: ${err.message}`);
        toast({
          variant: "destructive",
          title: "Error loading videos",
          description: `Failed to load videos: ${err.message}`
        });
        
        // Fall back to dummy data on error
        console.warn("Error occurred, falling back to dummy data");
        const { dummyVideos, dummyModules } = createDummyData();
        
        setVideos(dummyVideos);
        setModules(dummyModules);
        setIsUsingDummyData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Function to mark a video as completed
  const markVideoAsCompleted = async (videoId: string) => {
    // Skip for dummy data
    if (videoId.startsWith('dummy-')) {
      console.log("Cannot mark dummy video as completed");
      return;
    }
    
    // First update local state
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video.id === videoId ? { ...video, completed: true } : video
      )
    );
    
    // Also update in modules
    setModules(prevModules => 
      prevModules.map(module => ({
        ...module,
        videos: module.videos.map(video => 
          video.id === videoId ? { ...video, completed: true } : video
        )
      }))
    );
    
    // Then update in database if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      await markVideoCompleted(videoId, session.session.user.id);
    }
  };

  // Get a video by ID
  const getVideoById = (videoId: string) => {
    return videos.find(video => video.id === videoId) || null;
  };

  // Get videos by module ID
  const getVideosByModule = (moduleId: string) => {
    return videos.filter(video => video.moduleId === moduleId);
  };

  // Get a module by ID or slug
  const getModule = (idOrSlug: string) => {
    return modules.find(
      module => module.id === idOrSlug || module.slug === idOrSlug
    ) || null;
  };

  // Get completed videos count
  const getCompletedCount = () => {
    return videos.filter(video => video.completed).length;
  };

  return {
    videos,
    modules,
    loading,
    error,
    isUsingDummyData,
    markVideoAsCompleted,
    getVideoById,
    getVideosByModule,
    getModule,
    getCompletedCount,
  };
};
