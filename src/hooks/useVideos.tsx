
import { useState, useEffect } from "react";
import { Video, Module } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching videos and modules data...");
        
        // Fetch modules from Supabase - modules must be fetched before videos
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .order("order_index");
        
        if (modulesError) {
          console.error("Error fetching modules:", modulesError);
          throw modulesError;
        }
        
        console.log("Fetched modules:", modulesData?.length || 0, "records", modulesData);
        
        // Fetch videos from Supabase
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .eq("status", "published");
        
        if (videosError) {
          console.error("Error fetching videos:", videosError);
          throw videosError;
        }
        
        console.log("Fetched videos:", videosData?.length || 0, "records", videosData);
        
        // Fetch module_videos to connect videos to modules
        const { data: moduleVideosData, error: moduleVideosError } = await supabase
          .from("module_videos")
          .select("*")
          .order("order_index");
        
        if (moduleVideosError) {
          console.error("Error fetching module_videos:", moduleVideosError);
          throw moduleVideosError;
        }
        
        console.log("Fetched module_videos:", moduleVideosData?.length || 0, "records", moduleVideosData);
        
        if (videosData?.length === 0) {
          console.warn("No videos found in database. Check your data or RLS policies.");
        }
        
        // Format videos to match our Video type
        const formattedVideos: Video[] = (videosData || []).map(video => ({
          id: video.id,
          moduleId: "", // Will be populated based on module_videos
          title: video.title,
          description: video.description || "",
          youtubeId: video.youtube_id || "",
          duration: video.duration || "",
          order: 0, // Will be populated based on module_videos
          presenter: video.presenter || "",
          thumbnailUrl: video.thumbnail_url || "/placeholder.svg",
          completed: false, // Will be updated with user progress
        }));

        console.log("Formatted videos:", formattedVideos);
        
        // Fetch user's video progress if authenticated
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session?.user) {
          console.log("User authenticated, fetching video progress");
          const { data: progressData, error: progressError } = await supabase
            .from("video_progress")
            .select("*")
            .eq("user_id", session.session.user.id);
          
          if (!progressError && progressData) {
            console.log("Fetched video progress:", progressData.length, "records");
            // Update video completion status
            formattedVideos.forEach(video => {
              const progress = progressData.find(p => p.video_id === video.id);
              if (progress) {
                video.completed = progress.completed || false;
                console.log(`Video ${video.id} completion status: ${video.completed}`);
              }
            });
          } else if (progressError) {
            console.error("Error fetching video progress:", progressError);
          }
        } else {
          console.log("User not authenticated, skipping video progress fetch");
        }
        
        // Format modules to match our Module type
        const formattedModules: Module[] = (modulesData || []).map(module => {
          // Get videos for this module
          const moduleVideoIds = (moduleVideosData || [])
            .filter(mv => mv.module_id === module.id)
            .map(mv => ({ id: mv.video_id, order: mv.order_index || 0 }));
          
          const moduleVideos = formattedVideos
            .filter(video => moduleVideoIds.some(mv => mv.id === video.id))
            .map(video => {
              // Find the module_video entry to get the order
              const moduleVideo = moduleVideoIds.find(mv => mv.id === video.id);
              return {
                ...video,
                moduleId: module.id,
                order: moduleVideo?.order || 0
              };
            })
            .sort((a, b) => a.order - b.order);
          
          // Update moduleId in the main videos array
          moduleVideos.forEach(video => {
            const index = formattedVideos.findIndex(v => v.id === video.id);
            if (index !== -1) {
              formattedVideos[index].moduleId = module.id;
              formattedVideos[index].order = video.order;
            }
          });
          
          return {
            id: module.id,
            title: module.title,
            slug: module.slug,
            description: module.description || "",
            videos: moduleVideos
          };
        });
        
        console.log("Processed videos:", formattedVideos.length);
        console.log("Processed modules:", formattedModules.length, formattedModules);
        
        setVideos(formattedVideos);
        setModules(formattedModules);
      } catch (err) {
        console.error("Error in useVideos hook:", err);
        setError("Failed to load videos. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error loading videos",
          description: "Failed to load videos. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Function to mark a video as completed
  const markVideoAsCompleted = async (videoId: string) => {
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
      const userId = session.session.user.id;
      
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing record
        await supabase
          .from("video_progress")
          .update({
            completed: true,
            progress_percentage: 100,
            last_watched_at: new Date().toISOString()
          })
          .eq("id", existingProgress.id);
      } else {
        // Create new record
        await supabase
          .from("video_progress")
          .insert({
            user_id: userId,
            video_id: videoId,
            completed: true,
            progress_percentage: 100
          });
      }
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
    markVideoAsCompleted,
    getVideoById,
    getVideosByModule,
    getModule,
    getCompletedCount,
  };
};
