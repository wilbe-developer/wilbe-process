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

export interface SprintProfile {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  linkedin_url?: string;
  cv_url?: string;
  current_job?: string;
  company_incorporated: boolean;
  received_funding: boolean;
  funding_details?: string;
  has_deck: boolean;
  team_status: string;
  commercializing_invention: boolean;
  university_ip: boolean;
  tto_engaged: boolean;
  problem_defined: boolean;
  customer_engagement: string;
  market_known: boolean;
  market_gap_reason?: string;
  funding_amount?: string;
  has_financial_plan: boolean;
  funding_sources: string[];
  experiment_validated: boolean;
  industry_changing_vision: boolean;
}
