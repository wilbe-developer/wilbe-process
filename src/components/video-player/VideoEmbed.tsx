
import React from 'react';

interface VideoEmbedProps {
  youtubeEmbedId: string;
  title: string;
}

const VideoEmbed = ({ youtubeEmbedId, title }: VideoEmbedProps) => {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
