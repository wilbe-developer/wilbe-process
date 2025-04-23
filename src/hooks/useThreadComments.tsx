
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThreadComment } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';

export const useThreadComments = (threadId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['thread-comments', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('thread_comments')
        .select(`
          *,
          profiles!thread_comments_author_id_fkey(
            first_name,
            last_name,
            avatar
          ),
          user_roles!user_roles_user_id_fkey(role)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createComment = useMutation({
    mutationFn: async ({ content }: Pick<ThreadComment, 'content'>) => {
      const { data, error } = await supabase
        .from('thread_comments')
        .insert([
          {
            content,
            thread_id: threadId,
            author_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-comments', threadId] });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
  };
};
