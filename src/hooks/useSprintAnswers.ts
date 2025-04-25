
import { useState } from "react";
import { SprintSignupAnswers } from "@/types/sprint-signup";

export const useSprintAnswers = (initialAnswers?: Partial<SprintSignupAnswers>) => {
  const [answers, setAnswers] = useState<SprintSignupAnswers>({
    deck: '',
    team: '',
    invention: '',
    ip: '',
    problem: '',
    customers: '',
    market_known: '',
    funding_plan: '',
    funding_received: '',
    funding_details: '',
    sprint_goals: [],
    founder_profile: null,
    ...initialAnswers
  });

  const handleChange = (field: string, value: any) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [field]: value
    }));
  };

  const toggleMultiSelect = (name: string, value: string) => {
    setAnswers(prevAnswers => {
      const currentValues = prevAnswers[name] as string[] || [];
      if (currentValues.includes(value)) {
        return {
          ...prevAnswers,
          [name]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prevAnswers,
          [name]: [...currentValues, value]
        };
      }
    });
  };

  return {
    answers,
    setAnswers,
    handleChange,
    toggleMultiSelect
  };
};
