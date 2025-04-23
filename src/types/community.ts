
export interface Thread {
  id: string;
  author_id: string;
  challenge_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  } | null;
  author_role?: {
    role: string | null;
  } | null;
  comment_count?: {
    count: number | null;
  }[] | null;
}

export interface ThreadComment {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  } | null;
  author_role?: {
    role: string | null;
  } | null;
}

export interface ThreadView {
  user_id: string;
  thread_id: string;
  last_viewed_at: string;
}
