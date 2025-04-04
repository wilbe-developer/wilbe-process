
import { useState, useEffect } from "react";
import { VIDEOS, MODULES } from "@/lib/constants";
import { Video, Module } from "@/types";

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch these from an API
        const fetchedVideos = VIDEOS;
        const fetchedModules = MODULES.map(module => {
          // Attach videos to each module
          const moduleVideos = fetchedVideos.filter(video => video.moduleId === module.id);
          return {
            ...module,
            videos: moduleVideos,
          };
        });
        
        setVideos(fetchedVideos);
        setModules(fetchedModules);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to mark a video as completed
  const markVideoAsCompleted = (videoId: string) => {
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
