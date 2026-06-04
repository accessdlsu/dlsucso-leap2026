import type { User as FirebaseUser } from 'firebase/auth';

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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'admin';
  registeredClasses: string[];
}

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
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onAdminClick: () => void;
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
