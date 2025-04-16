
import React from 'react';
import { Video } from "@/types";
import SectionHeader from "./SectionHeader";
import VideoCarousel from "./VideoCarousel";

interface DeckBuilderSectionProps {
  title: string;
  subtitle: string;
  description: string;
  videos: Video[];
  slideNumbers?: string;
  templateUrl?: string;
  moduleId?: string;
}

const DEFAULT_TEMPLATE_URL = "https://www.canva.com/design/DAGIgXCPhJk/DCxXlmbcIlqQiUIOW-GWlw/view?utm_content=DAGIgXCPhJk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview";

const DeckBuilderSection = ({
  title,
  subtitle,
  description,
  videos,
  slideNumbers,
  moduleId,
  templateUrl = DEFAULT_TEMPLATE_URL
}: DeckBuilderSectionProps) => {
  return (
    <div className="bg-brand-darkBlue rounded-lg p-6 md:p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          description={description}
          slideNumbers={slideNumbers}
          templateUrl={templateUrl}
        />
        
        <div className="lg:col-span-2">
          <VideoCarousel 
            videos={videos}
            slideNumbers={slideNumbers}
            moduleId={moduleId}
          />
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderSection;
