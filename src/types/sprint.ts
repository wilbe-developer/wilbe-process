export interface SprintTask {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  upload_required: boolean;
  content: string | null;
  question: string | null;
  options: TaskOption[] | null;
}

export interface TaskOption {
  label: string;
  value: string;
}

export interface UserSprintProgress {
  id: string;
  user_id: string;
  task_id: string;
  completed: boolean;
  file_id: string | null;
  answers: Record<string, any> | null;
  completed_at: string | null;
}

export interface UserTaskProgress extends SprintTask {
  progress?: UserSprintProgress;
}

export interface UploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  drive_file_id: string;
  view_url: string;
  download_url: string;
  uploaded_at: string;
}

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
  team_status: 'solo' | 'employees' | 'cofounders';
  commercializing_invention: boolean;
  university_ip: boolean;
  tto_engaged: boolean;
  problem_defined: boolean;
  customer_engagement: 'yes' | 'no' | 'early';
  market_known: boolean;
  market_gap_reason?: string;
  funding_amount?: string;
  has_financial_plan: boolean;
  funding_sources: string[];
  experiment_validated: boolean;
  industry_changing_vision: boolean;
  sprint_started: boolean;
  sprint_completed: boolean;
  created_at: string;
}
