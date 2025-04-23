
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import VideoEmbed from '@/components/video-player/VideoEmbed';
import FileUploader from '@/components/sprint/FileUploader';

const TEAM_BUILDING_VIDEO_ID = "j5TEYCrLDYo";
const HIRING_TEMPLATE_PLACEHOLDER = "/hiring-template-placeholder.pdf";

interface SoloFounderHiringStepsProps {
  neededSkills: string;
  onSkillsChange: (skills: string) => void;
  uploadedFileId?: string;
  onFileUpload: (fileId: string) => void;
  hiringPlanStep: 'download' | 'upload';
  onHiringPlanStepChange: (step: 'download' | 'upload') => void;
}

// This is just a container component - the actual step progression
// is handled by StepBasedTaskLogic in useTeamStepBuilder.tsx
const SoloFounderHiringSteps: React.FC<SoloFounderHiringStepsProps> = ({
  neededSkills,
  onSkillsChange,
  uploadedFileId,
  onFileUpload,
  hiringPlanStep,
  onHiringPlanStepChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <VideoEmbed 
          youtubeEmbedId={TEAM_BUILDING_VIDEO_ID} 
          title="Company Culture and Team Building" 
        />
        <p className="text-sm text-gray-600 mt-2">
          Understanding how to build a strong team culture is essential, even as a solo founder planning for future growth.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea 
          value={neededSkills}
          onChange={(e) => onSkillsChange(e.target.value)}
          placeholder="Example: Technical co-founder with expertise in AI, Marketing professional with B2B SaaS experience, etc."
          rows={5}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        {hiringPlanStep === 'download' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Download our hiring plan template to help you structure your future team building efforts.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  window.open(HIRING_TEMPLATE_PLACEHOLDER, '_blank');
                  onHiringPlanStepChange('upload');
                }}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download Hiring Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Please upload your completed hiring plan:
            </p>
            {uploadedFileId ? (
              <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                <p className="text-green-700 flex items-center gap-2">
                  <Upload size={16} />
                  Hiring plan uploaded successfully!
                </p>
              </div>
            ) : (
              <FileUploader
                onFileUploaded={onFileUpload}
                isCompleted={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoloFounderHiringSteps;
