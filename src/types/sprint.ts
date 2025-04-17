
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
