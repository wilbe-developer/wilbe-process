
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
          author_profile:profiles(
            first_name,
            last_name,
            avatar
          ),
          author_role:user_roles(
            role
          ),
          comment_count:thread_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the comment count format
      const transformedData = data.map(thread => {
        return {
          ...thread,
          author_profile: thread.author_profile || null,
          author_role: thread.author_role || null,
          comment_count: thread.comment_count || []
        };
      });
      
      return transformedData as unknown as Thread[];
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
