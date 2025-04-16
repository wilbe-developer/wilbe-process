
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types";

// Fetch modules from Supabase
export const fetchModules = async () => {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .order("order_index");
  
  if (error) {
    console.error("Error fetching modules:", error);
    throw new Error(`Failed to fetch modules: ${error.message}`);
  }
  
  return data;
};

// Fetch videos from Supabase
export const fetchVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("status", "published");
  
  if (error) {
    console.error("Error fetching videos:", error);
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }
  
  return data;
};

// Fetch module_videos from Supabase
export const fetchModuleVideos = async () => {
  const { data, error } = await supabase
    .from("module_videos")
    .select("*")
    .order("order_index");
  
  if (error) {
    console.error("Error fetching module_videos:", error);
    throw new Error(`Failed to fetch module_videos: ${error.message}`);
  }
  
  return data;
};

// Fetch video progress for the current user
export const fetchVideoProgress = async (userId: string) => {
  if (!userId) {
    return [];
  }
  
  const { data, error } = await supabase
    .from("video_progress")
    .select("*")
    .eq("user_id", userId);
  
  if (error) {
    console.error("Error fetching video progress:", error);
    throw new Error(`Failed to fetch video progress: ${error.message}`);
  }
  
  return data || [];
};

// Mark a video as completed
export const markVideoCompleted = async (videoId: string, userId: string) => {
  if (!userId || videoId.startsWith('dummy-')) {
    console.log("Cannot mark video as completed: Invalid user ID or dummy video");
    return false;
  }
  
  // Check if progress record exists
  const { data: existingProgress } = await supabase
    .from("video_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  
  if (existingProgress) {
    // Update existing record
    const { error } = await supabase
      .from("video_progress")
      .update({
        completed: true,
        progress_percentage: 100,
        last_watched_at: new Date().toISOString()
      })
      .eq("id", existingProgress.id);
      
    return !error;
  } else {
    // Create new record
    const { error } = await supabase
      .from("video_progress")
      .insert({
        user_id: userId,
        video_id: videoId,
        completed: true,
        progress_percentage: 100
      });
      
    return !error;
  }
};
