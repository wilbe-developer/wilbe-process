
import React from "react";
import StepBasedTaskLogic from "@/components/sprint/StepBasedTaskLogic";

interface ProblemTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task?: any;
  hideMainQuestion?: boolean;
}

const ProblemTaskLogic: React.FC<ProblemTaskLogicProps> = ({ 
  isCompleted, 
  onComplete, 
  hideMainQuestion = false 
}) => {
  const steps = [
    {
      type: 'content' as const,
      content: 'Difference between your invention and the problem to solve'
    },
    ...(hideMainQuestion ? [] : [
      {
        type: 'question' as const,
        question: 'Have you identified a problem to solve that is beyond your invention?',
        options: [
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ]
      }
    ]),
    {
      type: 'upload' as const,
      uploads: ['One-pager explaining the problem and solution'],
      action: hideMainQuestion ? undefined : 'Please explain your challenge below.'
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

export default ProblemTaskLogic;
