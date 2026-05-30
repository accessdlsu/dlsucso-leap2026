// Window and scroll hooks
export { useWindowWidth, useIsMobile, useParallaxMouse, useScrollProgress, useScrollVisibility } from './useWindow';
// Data fetching hooks
export {
  useEvents,
  useMainEvents,
  useClasses,
  useEvent,
  useSlots,
  useThemes,
  useOrganizations,
  useFaqs,
  useConfig,
  useBookmarks,
  useHealth,
  useFilteredClasses,
  useUniqueDays,
} from './useData';
// Authentication hooks
export { useAuth } from './useAuth';
// Performance optimization hooks
export {
  useOptimizedScrollProgress,
  useOptimizedParallaxMouse,
  useOptimizedScrollVisibility,
  useLazyImage,
  useDebouncedWindowSize,
  useDebounceCallback,
  lazyLoadComponent,
  debounce,
  throttle,
  rafThrottle,
} from './usePerformance';
