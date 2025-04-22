
import React from "react";
import StepBasedTaskLogic from "@/components/sprint/StepBasedTaskLogic";

interface VisionTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
}

const VisionTaskLogic: React.FC<VisionTaskLogicProps> = ({ 
  isCompleted, 
  onComplete, 
  hideMainQuestion = false 
}) => {
  const steps = [
    ...(hideMainQuestion ? [] : [
      {
        type: 'question' as const,
        question: 'Does the ultimate version of your company (5-10 years in the future) change the industry?',
        options: [
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ]
      }
    ]),
    {
      type: 'content' as const,
      content: 'Create a vivid description of your company\'s ultimate vision and the transformative impact it will have on the industry.'
    },
    {
      type: 'upload' as const,
      uploads: ['1-pager painting a picture of the ultimate version of your company and its impact']
    }
  ];
  
  return (
    <StepBasedTaskLogic
      steps={steps}
      isCompleted={isCompleted}
      onComplete={onComplete}
    />
  );
};

export default VisionTaskLogic;
