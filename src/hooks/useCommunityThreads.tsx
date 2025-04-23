
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
      const { data, error } = await supabase
        .from('discussion_threads')
        .select(`
          *,
          profiles:author_id(
            first_name,
            last_name,
            avatar
          ),
          thread_comments(count),
          thread_views:thread_views!thread_views_thread_id_fkey(
            last_viewed_at
          ),
          user_roles:author_id(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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
