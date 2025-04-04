
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedIn?: string;
  institution?: string;
  location?: string;
  role?: string;
  bio?: string;
  approved: boolean;
  createdAt: Date;
  avatar?: string;
  isAdmin?: boolean;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  videos: Video[];
}

export interface Video {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  order: number;
  presenter: string;
  thumbnailUrl: string;
  completed?: boolean;
}

export type UserRole = 'user' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
