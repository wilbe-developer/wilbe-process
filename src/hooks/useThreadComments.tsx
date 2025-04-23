
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
      // First, fetch the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('thread_comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // For each comment, get the author profile and role
      const commentsWithDetails = await Promise.all(
        commentsData.map(async (comment) => {
          // Get author profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar')
            .eq('id', comment.author_id)
            .single();

          // Get author role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', comment.author_id)
            .single();

          return {
            ...comment,
            author_profile: profileData || null,
            author_role: roleData || null
          };
        })
      );
      
      return commentsWithDetails as ThreadComment[];
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
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
  };
};
