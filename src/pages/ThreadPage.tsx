
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThreadComments } from '@/hooks/useThreadComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const ThreadPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { 
    thread, 
    comments, 
    isLoading, 
    addComment,
    markThreadAsViewed 
  } = useThreadComments(threadId);
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mark thread as viewed when the page loads
  useEffect(() => {
    if (threadId) {
      markThreadAsViewed(threadId);
    }
  }, [threadId, markThreadAsViewed]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addComment.mutateAsync({ threadId: threadId as string, content: commentText });
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!thread) {
    return <div className="p-6 text-center">Thread not found</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto ${isMobile ? 'p-3' : 'p-6'}`}>
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/community')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to discussions
      </Button>

      <div className="bg-white rounded-lg shadow-sm border p-5 mb-6">
        <div className="flex items-start mb-4">
          <Avatar className="h-10 w-10 mr-3">
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
                <Badge variant="default" className="ml-2 bg-brand-pink">Admin</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>

        {thread.challenge_name && (
          <Badge variant="secondary" className="mb-4">
            {thread.challenge_name}
          </Badge>
        )}

        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{thread.content}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
      </h2>

      {comments.map((comment) => (
        <div key={comment.id} className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-start mb-2">
            <Avatar className="h-8 w-8 mr-3">
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
                  <Badge variant="default" className="ml-2 bg-brand-pink text-xs">Admin</Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="pl-11">
            <p className="whitespace-pre-wrap">{comment.content}</p>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmitComment} className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-medium mb-3">Add a reply</h3>
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="What are your thoughts?"
          className="mb-3"
          rows={4}
        />
        <Button type="submit" disabled={addComment.isPending}>
          {addComment.isPending ? 'Posting...' : 'Post Reply'}
        </Button>
      </form>
    </div>
  );
};

export default ThreadPage;
