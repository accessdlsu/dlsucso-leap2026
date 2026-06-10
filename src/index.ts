export { useMainEvents, useFilteredClasses, useUniqueDays } from './hooks/useData';

export { useAuth } from './hooks/useAuth';

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
