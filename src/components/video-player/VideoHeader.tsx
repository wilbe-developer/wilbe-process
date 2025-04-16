
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/lib/constants";
import { Module } from "@/types";

interface VideoHeaderProps {
  handleBackClick: () => void;
  isDeckBuilderVideo: boolean;
  isMobile: boolean;
  module?: Module | null;
  modules: Module[];
}

const VideoHeader = ({
  handleBackClick,
  isDeckBuilderVideo,
  isMobile,
  module,
  modules
}: VideoHeaderProps) => {
  return (
    <div className="flex items-center mb-4">
      <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> 
        {isDeckBuilderVideo ? "Build Your Deck" : "Knowledge Center"}
      </Button>
      {!isMobile && !isDeckBuilderVideo && (
        <div className="text-gray-500 text-sm">
          {module?.title && (
            <>
              or go to:{" "}
              {modules.filter(m => !m.isDeckBuilderModule).map((m, index) => (
                <span key={m.id}>
                  {index > 0 && " "}
                  <Link
                    to={`${PATHS.KNOWLEDGE_CENTER}?tab=${m.id}`}
                    className="text-gray-700 hover:text-brand-pink"
                  >
                    {m.title}
                  </Link>
                  {index < modules.filter(m => !m.isDeckBuilderModule).length - 1 && " "}
                </span>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoHeader;
