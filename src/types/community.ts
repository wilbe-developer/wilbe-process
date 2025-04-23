
export interface Thread {
  id: string;
  author_id: string;
  challenge_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadComment {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadView {
  user_id: string;
  thread_id: string;
  last_viewed_at: string;
}
