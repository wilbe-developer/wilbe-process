
import React from "react";
import StepBasedTaskLogic from "@/components/sprint/StepBasedTaskLogic";

interface IpTaskLogicProps {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
}

const IpTaskLogic: React.FC<IpTaskLogicProps> = ({ 
  isCompleted, 
  onComplete, 
  hideMainQuestion = false 
}) => {
  // This task has complex branching, so we'll define multiple possible paths
  // The StepBasedTaskLogic should handle the appropriate flow based on answers
  
  const baseSteps = [
    {
      type: 'content' as const,
      content: 'IP is not the most important asset — it\'s the people and their knowledge.'
    }
  ];
  
  const mainQuestion = {
    type: 'question' as const,
    question: 'Is your company reliant on something you\'ve invented / created at a university?',
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' }
    ]
  };
  
  const universityYesPath = [
    {
      type: 'question' as const,
      question: 'Have you begun conversations with the tech transfer office?',
      options: [
        { label: 'Yes', value: 'TTO-Yes' },
        { label: 'No', value: 'TTO-No' }
      ]
    },
    {
      type: 'upload' as const,
      uploads: [
        'Summary of conversation',
        'Equity % to be given to TTO'
      ],
      action: 'Please provide details about your TTO conversations and arrangements.'
    }
  ];
  
  const universityNoPath = [
    {
      type: 'question' as const,
      question: 'Do you own all the IP?',
      options: [
        { label: 'Yes', value: 'Own-Yes' },
        { label: 'No', value: 'Own-No' }
      ]
    },
    {
      type: 'question' as const,
      question: 'Have patents been filed?',
      options: [
        { label: 'Yes', value: 'Patents-Yes' },
        { label: 'No', value: 'Patents-No' }
      ]
    },
    {
      type: 'upload' as const,
      uploads: ['Patents or patent plans documentation'],
      action: 'Please upload your patents or explain your patent plans.'
    }
  ];
  
  // Combine steps based on hideMainQuestion
  const steps = [
    ...baseSteps,
    ...(hideMainQuestion ? [] : [mainQuestion]),
    ...(hideMainQuestion ? universityYesPath : []),
  ];
  
  return (
    <StepBasedTaskLogic
      steps={steps}
      isCompleted={isCompleted}
      onComplete={onComplete}
    />
  );
};

export default IpTaskLogic;
