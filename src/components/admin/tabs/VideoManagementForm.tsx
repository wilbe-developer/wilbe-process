
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoManagementFormProps {
  modules: { id: string; title: string }[];
  onVideoAdded: () => void;
}

const VideoManagementForm = ({ modules, onVideoAdded }: VideoManagementFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [presenter, setPresenter] = useState("");
  const [duration, setDuration] = useState("");
  const [moduleId, setModuleId] = useState(modules.length > 0 ? modules[0].id : "");

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!videoTitle || !videoLink || !videoDescription || !moduleId) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      const youtubeId = extractYoutubeId(videoLink);
      if (!youtubeId) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL",
          variant: "destructive"
        });
        return;
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          title: videoTitle,
          description: videoDescription,
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          presenter: presenter,
          duration: duration,
          status: 'published'
        })
        .select()
        .single();
      
      if (videoError) throw videoError;
      
      const { error: moduleVideoError } = await supabase
        .from('module_videos')
        .insert({
          module_id: moduleId,
          video_id: videoData.id
        });
      
      if (moduleVideoError) throw moduleVideoError;
      
      toast({
        title: "Video Added",
        description: "The video has been added to the knowledge center.",
      });
      
      setVideoLink("");
      setVideoTitle("");
      setVideoDescription("");
      setPresenter("");
      setDuration("");
      
      // Call the callback to notify parent
      onVideoAdded();
      
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Video Content</CardTitle>
        <CardDescription>
          Add new videos to the knowledge center
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoLink">YouTube Link</Label>
            <Input
              id="videoLink"
              placeholder="https://youtube.com/watch?v=..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoTitle">Title</Label>
            <Input
              id="videoTitle"
              placeholder="Video title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="presenter">Presenter</Label>
            <Input
              id="presenter"
              placeholder="Name of presenter"
              value={presenter}
              onChange={(e) => setPresenter(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="e.g. 10:30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoDescription">Description</Label>
            <textarea
              id="videoDescription"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Video description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="moduleSelect">Module</Label>
            <select
              id="moduleSelect"
              className="w-full px-3 py-2 border rounded-md"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
            >
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            Add Video
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoManagementForm;
