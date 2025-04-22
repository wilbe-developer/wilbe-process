
export type Step = {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'email' | 'select' | 'file' | 'textarea' | 'checkbox' | 'conditional';
  options?: { value: string; label: string; }[];
  conditional?: {
    field: string;
    value: string;
    component: React.ReactNode;
  }[];
};

export type SprintSignupAnswers = {
  [key: string]: any;
};
