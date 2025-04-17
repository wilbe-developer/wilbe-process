
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SprintTask, UserSprintProgress, UserTaskProgress, TaskOption } from "@/types/sprint";
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
      
      // Process and transform the data to ensure type safety
      return (data || []).map(task => {
        // Convert options to proper format if needed
        let parsedOptions: TaskOption[] | null = null;
        
        if (task.options) {
          try {
            if (typeof task.options === 'string') {
              parsedOptions = JSON.parse(task.options);
            } else {
              // If it's already an object/array from Supabase
              parsedOptions = task.options as unknown as TaskOption[];
            }
          } catch (e) {
            console.error('Failed to parse options for task:', task.id, e);
            parsedOptions = null;
          }
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          order_index: task.order_index,
          upload_required: task.upload_required,
          content: task.content,
          question: task.question,
          options: parsedOptions
        } as SprintTask;
      });
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
      
      // Process and transform the data to ensure type safety
      return (data || []).map(progress => {
        // Convert answers to proper Record type if needed
        let parsedAnswers: Record<string, any> | null = null;
        
        if (progress.answers) {
          try {
            if (typeof progress.answers === 'string') {
              parsedAnswers = JSON.parse(progress.answers);
            } else {
              // If it's already an object from Supabase
              parsedAnswers = progress.answers as Record<string, any>;
            }
          } catch (e) {
            console.error('Failed to parse answers for progress:', progress.id, e);
            parsedAnswers = null;
          }
        }
        
        return {
          id: progress.id,
          user_id: progress.user_id,
          task_id: progress.task_id,
          completed: progress.completed,
          file_id: progress.file_id,
          answers: parsedAnswers,
          completed_at: progress.completed_at
        } as UserSprintProgress;
      });
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
