
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Thread } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';

export const useCommunityThreads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      // First, fetch the threads
      const { data: threadsData, error: threadsError } = await supabase
        .from('discussion_threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (threadsError) throw threadsError;
      
      // For each thread, get the author profile, role, and comment count
      const threadsWithDetails = await Promise.all(
        threadsData.map(async (thread) => {
          // Get author profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar')
            .eq('id', thread.author_id)
            .single();

          // Get author role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', thread.author_id)
            .single();

          // Get comment count
          const { count } = await supabase
            .from('thread_comments')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

          return {
            ...thread,
            author_profile: profileData || null,
            author_role: roleData || null,
            comment_count: [{ count: count || 0 }]
          };
        })
      );
      
      return threadsWithDetails as Thread[];
    },
  });

  const createThread = useMutation({
    mutationFn: async ({ title, content, challenge_id }: Partial<Thread>) => {
      const { data, error } = await supabase
        .from('discussion_threads')
        .insert([
          {
            title,
            content,
            challenge_id,
            author_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  return {
    threads,
    isLoading,
    createThread,
  };
};
