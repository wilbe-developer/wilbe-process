
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Step } from "@/types/sprint-signup";

interface SprintFormFieldProps {
  step: Step;
  value: any;
  onChange: (field: string, value: any) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMultiSelect: (field: string, value: string) => void;
  uploadedFile: File | null;
}

export const SprintFormField: React.FC<SprintFormFieldProps> = ({
  step,
  value,
  onChange,
  onFileUpload,
  toggleMultiSelect,
  uploadedFile
}) => {
  switch (step.type) {
    case 'text':
      return (
        <Input 
          value={value || ''} 
          onChange={(e) => onChange(step.id, e.target.value)} 
          placeholder="Your answer" 
        />
      );
    
    case 'email':
      return (
        <Input 
          type="email" 
          value={value || ''} 
          onChange={(e) => onChange(step.id, e.target.value)} 
          placeholder="Your email" 
        />
      );
    
    case 'textarea':
      return (
        <Textarea 
          value={value || ''} 
          onChange={(e) => onChange(step.id, e.target.value)} 
          placeholder="Your answer" 
        />
      );
    
    case 'file':
      return (
        <div className="flex flex-col space-y-4">
          <Input 
            type="file" 
            onChange={onFileUpload} 
            className="border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer"
          />
          {uploadedFile && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check size={16} />
              <span>{uploadedFile.name} selected</span>
            </div>
          )}
        </div>
      );
    
    case 'select':
      return step.options ? (
        <RadioGroup
          value={value || ''}
          onValueChange={(value) => onChange(step.id, value)}
          className="space-y-3"
        >
          {step.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${step.id}-${option.value}`} />
              <Label htmlFor={`${step.id}-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : null;
    
    case 'checkbox':
      return step.options ? (
        <div className="space-y-3">
          {step.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                checked={(value || []).includes(option.value)}
                onCheckedChange={() => toggleMultiSelect(step.id, option.value)}
                id={`${step.id}-${option.value}`} 
              />
              <Label htmlFor={`${step.id}-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      ) : null;
    
    case 'conditional':
      return step.conditional ? (
        <>
          {step.conditional.map((condition, index) => {
            if (value === condition.value) {
              return (
                <div key={index}>
                  {React.cloneElement(condition.component as React.ReactElement, {
                    value: value || '',
                    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                      onChange(step.id, e.target.value)
                  })}
                </div>
              );
            }
            return null;
          })}
        </>
      ) : null;
    
    default:
      return null;
  }
};
