
import { useState } from 'react';
import { useCommunityThreads } from '@/hooks/useCommunityThreads';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const CommunityPage = () => {
  const { threads, isLoading } = useCommunityThreads();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'p-3' : 'p-6'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Community Discussions</h1>
        <Button onClick={() => navigate('/community/new')} size={isMobile ? 'sm' : 'default'}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="bg-white rounded-lg shadow-sm border p-4 hover:border-brand-pink transition-colors cursor-pointer"
            onClick={() => navigate(`/community/thread/${thread.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thread.author_profile?.avatar || undefined} />
                    <AvatarFallback>
                      {thread.author_profile?.first_name?.[0] || ''}
                      {thread.author_profile?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">
                      {thread.author_profile?.first_name || ''} {thread.author_profile?.last_name || ''}
                    </span>
                    {thread.author_role?.role === 'admin' && (
                      <Badge variant="default" className="ml-2">Admin</Badge>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{thread.title}</h3>
                <p className="text-gray-600 line-clamp-2">{thread.content}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(thread.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>{thread.comment_count?.count || 0} replies</span>
              {thread.challenge_id && (
                <Badge variant="secondary">From Sprint Challenge</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
