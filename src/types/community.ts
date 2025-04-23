
export interface Thread {
  id: string;
  author_id: string;
  challenge_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  } | null;
  user_roles?: {
    role: string | null;
  } | null;
  thread_comments?: { 
    count: number 
  }[] | null;
  thread_views?: {
    last_viewed_at: string;
  }[] | null;
}

export interface ThreadComment {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  } | null;
  user_roles?: {
    role: string | null;
  } | null;
}

export interface ThreadView {
  user_id: string;
  thread_id: string;
  last_viewed_at: string;
}
