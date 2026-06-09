import type { UserProfile } from 'leapify/types';

export type ViewType = 'home' | 'about' | 'major-events' | 'classes' | 'faq' | 'contact';
export type SortOption = 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc';
export type ViewMode = 'grid' | 'list';

export interface LeapClass {
  id: string;
  title: string;
  org: string;
  date: string;
  time: string;
  venue: string;
  slots: number;
  subtheme: string;
  image: string;
  orgLogo: string | null;
  googleFormUrl: string;
  description: string;
  isSpotlight: boolean;
}

// Re-export the canonical UserProfile from the backend
export type { UserProfile };

export interface MainEvent {
  id: string;
  title: string;
  description: string;
  img: string;
  tag: string;
  accent: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isScrolled: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export interface ClassCardProps {
  item: LeapClass;
  index: number;
  onClick?: () => void;
  viewMode?: ViewMode;
}

export interface MainEventCardProps {
  event: MainEvent;
  index: number;
  onClick?: () => void;
}
