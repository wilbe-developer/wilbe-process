
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityThreads } from '@/hooks/useCommunityThreads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const NewThreadPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createThread } = useCommunityThreads();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createThread.mutateAsync({ title, content });
      toast.success('Thread created successfully');
      navigate('/community');
    } catch (error) {
      toast.error('Failed to create thread');
    }
  };

  return (
    <div className={isMobile ? 'p-3' : 'p-6'}>
      <h1 className={`font-bold mb-6 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Start a New Discussion</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to discuss?"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={6}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createThread.isPending}>
            Create Thread
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/community')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewThreadPage;
