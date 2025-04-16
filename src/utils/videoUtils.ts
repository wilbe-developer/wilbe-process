
import { Video, Module } from "@/types";
import { VIDEOS, MODULES } from "@/lib/constants";

// Format videos from Supabase response to our Video type
export const formatVideosFromSupabase = (videosData: any[]): Video[] => {
  if (!videosData) return [];
  
  return videosData.map(video => ({
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
    created_at: video.created_at
  }));
};

// Update video completion status based on progress data
export const updateVideoCompletionStatus = (videos: Video[], progressData: any[]): Video[] => {
  return videos.map(video => {
    const videoWithProgress = { ...video };
    const progress = progressData.find(p => p.video_id === video.id);
    if (progress) {
      videoWithProgress.completed = progress.completed || false;
    }
    return videoWithProgress;
  });
};

// Create a copy of videos with deck builder properties
export const createDeckBuilderVideo = (
  video: Video,
  moduleId: string,
  order: number,
  isDeckBuilderModule: boolean,
  title?: string
): Video => {
  const videoCopy = { ...video };
  
  // Set module-specific properties
  videoCopy.moduleId = moduleId;
  videoCopy.order = order;
  
  // Add deck builder specific properties if this is a deck builder module
  if (isDeckBuilderModule) {
    videoCopy.isDeckBuilderVideo = true;
    videoCopy.deckBuilderModuleId = moduleId;
    
    // Set slide number based on module title or slug for deck builder modules
    if (title === 'The Team' || moduleId.includes('the-team')) {
      videoCopy.deckBuilderSlide = "1";
    } else if (title === 'Proposition' || moduleId.includes('proposition')) {
      videoCopy.deckBuilderSlide = "2 & 3";
    } else if (title === 'Market' || moduleId.includes('market')) {
      videoCopy.deckBuilderSlide = "4 & 5";
    } else {
      videoCopy.deckBuilderSlide = "";
    }
  }
  
  return videoCopy;
};

// Format modules from Supabase response
export const formatModulesFromSupabase = (
  modulesData: any[], 
  moduleVideosData: any[],
  formattedVideos: Video[]
): Module[] => {
  if (!modulesData) return [];
  
  return modulesData.map(module => {
    // Get videos for this module
    const moduleVideoIds = (moduleVideosData || [])
      .filter(mv => mv.module_id === module.id)
      .map(mv => ({ id: mv.video_id, order: mv.order_index || 0 }));
    
    const moduleVideos = formattedVideos
      .filter(video => moduleVideoIds.some(mv => mv.id === video.id))
      .map(video => createDeckBuilderVideo(
        video,
        module.id,
        moduleVideoIds.find(mv => mv.id === video.id)?.order || 0,
        module.is_deck_builder_module || false,
        module.title
      ))
      .sort((a, b) => a.order - b.order);
    
    return {
      id: module.id,
      title: module.title,
      slug: module.slug,
      description: module.description || "",
      videos: moduleVideos,
      isDeckBuilderModule: module.is_deck_builder_module || false,
      orderIndex: module.order_index,
      deckBuilderSlide: module.is_deck_builder_module ? 
        module.title === 'The Team' || module.slug === 'the-team' ? "1" : 
        module.title === 'Proposition' || module.slug === 'mvd-proposition' ? "2 & 3" :
        module.title === 'Market' || module.slug === 'mvd-market' ? "4 & 5" : ""
        : undefined
    };
  });
};

// Create dummy data for videos and modules
export const createDummyData = (): { dummyVideos: Video[], dummyModules: Module[] } => {
  const dummyVideos: Video[] = VIDEOS.map(video => ({
    ...video,
    id: `dummy-${video.id}`, // Mark as dummy data for debugging
    completed: false
  }));
  
  const dummyModules: Module[] = MODULES.map(module => {
    const moduleVideos = dummyVideos.filter(v => v.moduleId === module.id);
    return {
      ...module,
      id: `dummy-${module.id}`, // Mark as dummy data for debugging
      videos: moduleVideos
    };
  });
  
  return { dummyVideos, dummyModules };
};
