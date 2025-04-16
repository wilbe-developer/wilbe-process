
import React from 'react';
import { Link } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { Video } from "@/types";

interface VideoRelatedListProps {
  relatedVideos: Video[];
  isDeckBuilderVideo: boolean;
  deckBuilderSlide?: string | null;
  title: string;
  subtitle: string;
}

const VideoRelatedList = ({
  relatedVideos,
  isDeckBuilderVideo,
  deckBuilderSlide,
  title,
  subtitle
}: VideoRelatedListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-gray-600 mb-2">{subtitle}</p>
      
      <h3 className="text-sm font-medium">Videos in this list:</h3>
      <div className="space-y-4">
        {relatedVideos.map((relatedVideo) => (
          <div key={relatedVideo.id} className="flex items-center">
            <Link
              to={`${PATHS.VIDEO}/${relatedVideo.id}${isDeckBuilderVideo ? '?deckBuilder=true' : ''}${deckBuilderSlide ? `&slide=${deckBuilderSlide}` : ''}`}
              className="flex items-center hover:bg-gray-50 p-2 rounded-md w-full"
            >
              <div className="flex-shrink-0 relative">
                <img
                  src={relatedVideo.thumbnailUrl || "/placeholder.svg"}
                  alt={relatedVideo.title}
                  className="w-24 h-16 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                  {relatedVideo.duration}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium line-clamp-2">
                  {relatedVideo.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {relatedVideo.duration}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRelatedList;
