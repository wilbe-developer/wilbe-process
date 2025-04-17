
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SprintTask, UserSprintProgress, UserTaskProgress } from "@/types/sprint";
import { useAuth } from "./useAuth";

export const useSprintTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all sprint tasks
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["sprintTasks"],
    queryFn: async (): Promise<SprintTask[]> => {
      const { data, error } = await supabase
        .from("sprint_tasks")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user progress for sprint tasks
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["userSprintProgress", user?.id],
    queryFn: async (): Promise<UserSprintProgress[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_sprint_progress")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get combined task and progress data
  const tasksWithProgress: UserTaskProgress[] = tasks?.map(task => {
    const progress = userProgress?.find(p => p.task_id === task.id);
    return {
      ...task,
      progress
    };
  }) || [];

  // Update user progress
  const updateProgress = useMutation({
    mutationFn: async (params: { 
      taskId: string; 
      completed?: boolean; 
      answers?: Record<string, any>; 
      fileId?: string | null;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { taskId, completed, answers, fileId } = params;
      
      // Check if progress entry exists
      const { data: existingProgress } = await supabase
        .from("user_sprint_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("task_id", taskId)
        .maybeSingle();
      
      const now = new Date().toISOString();
      
      if (existingProgress) {
        // Update existing progress
        const updateData: Partial<UserSprintProgress> = {};
        
        if (completed !== undefined) {
          updateData.completed = completed;
          if (completed) updateData.completed_at = now;
        }
        
        if (answers !== undefined) updateData.answers = answers;
        if (fileId !== undefined) updateData.file_id = fileId;
        
        const { error } = await supabase
          .from("user_sprint_progress")
          .update(updateData)
          .eq("id", existingProgress.id);
        
        if (error) throw error;
      } else {
        // Create new progress entry
        const { error } = await supabase
          .from("user_sprint_progress")
          .insert({
            user_id: user.id,
            task_id: taskId,
            completed: completed || false,
            answers: answers || null,
            file_id: fileId || null,
            completed_at: completed ? now : null
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSprintProgress", user?.id] });
    }
  });

  return {
    tasks,
    userProgress,
    tasksWithProgress,
    isLoading: isLoading || isLoadingProgress,
    error,
    updateProgress
  };
};
