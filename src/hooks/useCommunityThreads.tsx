
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Thread, Challenge } from '@/types/community';
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
            
          // Get challenge name if challenge_id is present
          let challengeName = null;
          if (thread.challenge_id) {
            const { data: challengeData } = await supabase
              .from('sprint_tasks')
              .select('title')
              .eq('id', thread.challenge_id)
              .single();
            
            if (challengeData) {
              challengeName = challengeData.title;
            }
          }

          return {
            ...thread,
            author_profile: profileData || null,
            author_role: roleData || null,
            comment_count: count ? [{ count }] : [{ count: 0 }],
            challenge_name: challengeName
          };
        })
      );
      
      return threadsWithDetails as Thread[];
    },
  });

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['sprint-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .select('id, title, description, category')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Challenge[];
    }
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

      if (error) {
        console.error('Error creating thread:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  return {
    threads,
    challenges,
    isLoading: isLoading || isLoadingChallenges,
    createThread,
  };
};
