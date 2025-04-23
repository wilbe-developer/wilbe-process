
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useThreadComments } from '@/hooks/useThreadComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ThreadPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [newComment, setNewComment] = useState('');
  const { comments, createComment } = useThreadComments(threadId!);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      // Fetch the thread
      const { data: threadData, error: threadError } = await supabase
        .from('discussion_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Get author profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar')
        .eq('id', threadData.author_id)
        .single();

      // Get author role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', threadData.author_id)
        .single();

      return {
        ...threadData,
        author_profile: profileData || null,
        author_role: roleData || null
      };
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComment.mutateAsync({ content: newComment });
      setNewComment('');
      toast.success('Comment posted successfully');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  if (threadLoading || !thread) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'p-3' : 'p-6'}>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/community')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discussions
      </Button>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={thread.author_profile?.avatar || undefined} />
            <AvatarFallback>
              {thread.author_profile?.first_name?.[0] || ''}
              {thread.author_profile?.last_name?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-medium">
                {thread.author_profile?.first_name || ''} {thread.author_profile?.last_name || ''}
              </span>
              {thread.author_role?.role === 'admin' && (
                <Badge variant="default" className="ml-2">Admin</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(thread.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <h1 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          {thread.title}
        </h1>
        <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author_profile?.avatar || undefined} />
                <AvatarFallback>
                  {comment.author_profile?.first_name?.[0] || ''}
                  {comment.author_profile?.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">
                    {comment.author_profile?.first_name || ''} {comment.author_profile?.last_name || ''}
                  </span>
                  {comment.author_role?.role === 'admin' && (
                    <Badge variant="default" className="ml-2">Admin</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="mt-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            rows={4}
            required
            className="mb-3"
          />
          <Button type="submit" disabled={createComment.isPending}>
            Post Reply
          </Button>
        </form>
      )}
    </div>
  );
};

export default ThreadPage;
