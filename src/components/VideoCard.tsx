
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PATHS } from "@/lib/constants";
import { Video } from "@/types";
import { CheckCircle } from "lucide-react";

interface VideoCardProps {
  video: Video;
  showModule?: boolean;
  moduleTitle?: string;
}

const VideoCard = ({ video, showModule = false, moduleTitle }: VideoCardProps) => {
  // Construct the URL with the appropriate query parameters
  const videoUrl = `${PATHS.VIDEO}/${video.id}${
    video.isDeckBuilderVideo ? `?deckBuilder=true${
      video.deckBuilderSlide ? `&slide=${video.deckBuilderSlide}` : ''
    }` : ''
  }`;
  
  console.log("Rendering VideoCard with data:", { 
    title: video.title,
    id: video.id, 
    moduleId: video.moduleId || "none", 
    moduleTitle: moduleTitle || "none",
    thumbnailUrl: video.thumbnailUrl || "none",
    youtubeId: video.youtubeId || "none",
    deckBuilder: video.isDeckBuilderVideo ? "yes" : "no",
    deckBuilderSlide: video.deckBuilderSlide || "none",
    deckBuilderModuleId: video.deckBuilderModuleId || "none",
    source: video.id.includes("dummy-") ? "dummy data" : "supabase"
  });
  
  // Determine the module text to display
  const getModuleText = () => {
    if (moduleTitle) {
      return moduleTitle;
    } else if (video.isDeckBuilderVideo) {
      return "Deck Builder";
    } else if (video.moduleId) {
      // Find the module by ID to get the proper title
      const module = document.querySelector(`[data-module-id="${video.moduleId}"]`);
      const moduleName = module?.getAttribute('data-module-title');
      
      // If we have a module element, return its title
      if (moduleName) {
        return moduleName;
      }
      
      // Try to extract module name from the video object or fall back to a default
      if (video.moduleId.includes('proposition') || video.moduleId.includes('prop')) {
        return 'Proposition';
      } else if (video.moduleId.includes('market')) {
        return 'Your Market';
      } else if (video.moduleId.includes('team')) {
        return 'The Team';
      } else if (video.moduleId.includes('fundraising')) {
        return 'Fundraising 101';
      } else if (video.moduleId.includes('intro') || video.moduleId.includes('mvd-intro')) {
        return 'MVD Introduction';
      }
      
      // Final fallback
      return "Member Stories";
    } else {
      return "Member Stories";
    }
  };
  
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow h-full flex flex-col">
      <Link to={videoUrl} className="flex flex-col h-full">
        <div className="relative">
          <img 
            src={video.thumbnailUrl || "/placeholder.svg"} 
            alt={video.title}
            className="w-full aspect-video object-cover"
            onError={(e) => {
              console.log("Error loading image, falling back to placeholder for video:", video.title);
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-0.5 rounded">
              {video.duration}
            </div>
          )}
          {video.completed && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
            </div>
          )}
          {video.isDeckBuilderVideo && video.deckBuilderSlide && (
            <div className="absolute top-2 left-2 bg-brand-pink text-white text-xs px-1.5 py-0.5 rounded">
              Slide {video.deckBuilderSlide}
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="text-xs text-gray-500 mb-1">
            {showModule && video.moduleId ? 
              `Module: ${getModuleText()}` : 
              getModuleText()}
          </div>
          <h3 className="font-medium text-base mb-2 line-clamp-2 group-hover:text-brand-pink transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-gray-700 line-clamp-2 mb-2 flex-grow">
            {video.description || "No description available"}
          </p>
          <div className="text-sm text-brand-pink">View Class</div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default VideoCard;
