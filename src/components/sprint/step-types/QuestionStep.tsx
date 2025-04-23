
import React from "react";
import { Button } from "@/components/ui/button";

interface QuestionStepProps {
  question: string;
  options?: Array<{ label: string; value: string }>;
  selectedAnswer?: string;
  onAnswerSelect: (value: string) => void;
}

const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
}) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">{question}</h2>
      {options && (
        <div className="flex flex-wrap gap-3 mb-4">
          {options.map(option => (
            <Button
              key={option.value}
              variant={selectedAnswer === option.value ? "default" : "outline"}
              onClick={() => onAnswerSelect(option.value)}
              className="flex-grow md:flex-grow-0"
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </>
  );
};

export default QuestionStep;
