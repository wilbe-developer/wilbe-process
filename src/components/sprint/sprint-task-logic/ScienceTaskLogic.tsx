
import React from "react";
import StepBasedTaskLogic from "@/components/sprint/StepBasedTaskLogic";

interface ScienceTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
}

const ScienceTaskLogic: React.FC<ScienceTaskLogicProps> = ({ 
  isCompleted, 
  onComplete, 
  hideMainQuestion = false 
}) => {
  const steps = [
    ...(hideMainQuestion ? [] : [
      {
        type: 'question' as const,
        question: 'Did you come up with an invention or discovery that you're trying to commercialize?',
        options: [
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ]
      }
    ]),
    {
      type: 'upload' as const,
      uploads: [
        'Single page explaining the scientific intuition',
        '1-2 supporting scientific publications'
      ]
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

export default ScienceTaskLogic;
