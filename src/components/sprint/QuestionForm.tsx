
import { useState } from "react";
import { SprintTask } from "@/types/sprint";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface QuestionFormProps {
  task: SprintTask;
  initialAnswers?: Record<string, any>;
  onSubmit: (answers: Record<string, any>) => void;
  isCompleted?: boolean;
}

const QuestionForm = ({ task, initialAnswers = {}, onSubmit, isCompleted }: QuestionFormProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  
  const handleOptionChange = (value: string) => {
    setAnswers({ ...answers, answer: value });
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers({ ...answers, answer: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  if (!task.question) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{task.question}</h3>
        
        {task.options ? (
          <RadioGroup
            value={answers.answer}
            onValueChange={handleOptionChange}
            className="space-y-3"
          >
            {task.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            placeholder="Enter your answer..."
            value={answers.answer || ""}
            onChange={handleTextChange}
            className="min-h-32"
          />
        )}
      </div>
      
      <Button
        type="submit"
        disabled={!answers.answer || isCompleted}
        className="w-full md:w-auto"
      >
        Submit Answer
      </Button>
    </form>
  );
};

export default QuestionForm;
