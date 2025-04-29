
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
  about?: string;
  approved: boolean;
  createdAt: Date;
  avatar?: string;
  isAdmin?: boolean;
  twitterHandle?: string;
  expertise?: string;
  activityStatus?: string;
  lastLoginDate?: Date;
  status?: string;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  videos: Video[];
  isDeckBuilderModule?: boolean;
  deckBuilderSlide?: string;
  orderIndex?: number;
}

export interface Video {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  youtubeId?: string;
  duration?: string;
  order?: number;
  presenter?: string;
  thumbnailUrl?: string;
  completed?: boolean;
  created_at?: string;
  // Deck builder specific properties
  isDeckBuilderVideo?: boolean;
  deckBuilderSlide?: string;
  deckBuilderModuleId?: string; // To store the deck builder specific module
}

// Updated to match what's actually used in the database
export type UserRole = 'user' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
