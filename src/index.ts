/**
 * Central export file for all modular components
 * Use this for convenient imports throughout the app
 */

// Hooks
export {
  useWindowWidth,
  useIsMobile,
  useParallaxMouse,
  useScrollProgress,
  useScrollVisibility,
} from './hooks/useWindow';

export { useMainEvents, useFilteredClasses, useUniqueDays } from './hooks/useData';

export { useAuth } from './hooks/useAuth';

// Types
export type {
  ViewType,
  SortOption,
  ViewMode,
  LeapClass,
  UserProfile,
  MainEvent,
  AuthContextType,
  NavigationProps,
  ClassCardProps,
  MainEventCardProps,
} from './types';

// Utils
export {
  scrollToElement,
  scrollToTop,
  setBodyOverflow,
  formatDate,
  formatTime,
  debounce,
  throttle,
  classNames,
  isMobileScreen,
  extractImageUrl,
  truncateText,
  sleep,
  getRandomItem,
  isInViewport,
} from './utils/helpers';

export {
  COLORS,
  ANIMATION_VARIANTS,
  TRANSITIONS,
  FIREFLY_CONFIG,
  HOME_FIREFLY_CONFIG,
  BREAKPOINTS,
  Z_INDEX,
  NAV_ITEMS,
  PAGINATION_CONFIG,
} from './utils/constants';

// Shared Components
export { Fireflies, PageHeroFireflies } from './components/shared/Fireflies';
export { TheAwakening } from './components/shared/TheAwakening';
export { ScrollProgress } from './components/shared/ScrollProgress';
