
export type Step = {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'email' | 'select' | 'file' | 'textarea' | 'checkbox' | 'conditional';
  options?: { value: string; label: string; }[];
  conditional?: {
    field: string;
    value: string;
    componentType: string;
    componentProps?: Record<string, string>;
  }[];
};

export type SprintSignupAnswers = {
  [key: string]: any;
};
