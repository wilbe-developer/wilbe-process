
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThreadComment, Thread } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';

export const useThreadComments = (threadId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentAdded, setCommentAdded] = useState(false);

  // Get thread details
  const { data: thread, isLoading: isThreadLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId) return null;

      const { data, error } = await supabase
        .from('discussion_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;

      // Get author profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar')
        .eq('id', data.author_id)
        .maybeSingle();

      // Get author role - using maybeSingle to handle no results gracefully
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.author_id)
        .maybeSingle();

      // Get challenge name if challenge_id exists
      let challengeName = null;
      if (data.challenge_id) {
        const { data: challengeData } = await supabase
          .from('sprint_tasks')
          .select('title')
          .eq('id', data.challenge_id)
          .maybeSingle();
        
        challengeName = challengeData?.title;
      }

      return {
        ...data,
        author_profile: profileData || null,
        author_role: roleData || null,
        challenge_name: challengeName
      } as Thread;
    },
    enabled: !!threadId,
  });

  // Get comments for the thread
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['thread-comments', threadId, commentAdded],
    queryFn: async () => {
      if (!threadId) return [];

      const { data, error } = await supabase
        .from('thread_comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // For each comment, get the author profile and role
      const commentsWithAuthor = await Promise.all(
        data.map(async (comment) => {
          // Get author profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar')
            .eq('id', comment.author_id)
            .maybeSingle();

          // Get author role - using maybeSingle to handle no results gracefully
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', comment.author_id)
            .maybeSingle();

          return {
            ...comment,
            author_profile: profileData || null,
            author_role: roleData || null,
          };
        })
      );

      return commentsWithAuthor as ThreadComment[];
    },
    enabled: !!threadId,
  });

  // Add a comment to the thread
  const addComment = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string, content: string }) => {
      const { data, error } = await supabase
        .from('thread_comments')
        .insert([
          {
            thread_id: threadId,
            author_id: user?.id,
            content,
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      setCommentAdded(prev => !prev); // Toggle to trigger query refetch
      queryClient.invalidateQueries({ queryKey: ['thread-comments', threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] }); // Refresh thread list to update comment counts
    },
  });

  // Mark thread as viewed
  const markThreadAsViewed = useCallback(async (threadId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('thread_views')
        .upsert(
          {
            user_id: user.id,
            thread_id: threadId,
            last_viewed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,thread_id' }
        );

      if (error) {
        console.error('Error marking thread as viewed:', error);
      }
    } catch (error) {
      console.error('Error marking thread as viewed:', error);
    }
  }, [user]);

  return {
    thread,
    comments,
    isLoading: isThreadLoading || isCommentsLoading,
    addComment,
    markThreadAsViewed,
  };
};
