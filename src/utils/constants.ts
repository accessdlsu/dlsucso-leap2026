// Brand Colors
export const COLORS = {
  leap: {
    dark: '#334b46',
    gold: '#de9a49',
    tan: '#e0b788',
    olive: '#7c6b4b',
    maroon: '#803e2f',
    yellow: '#fae185',
    cream: '#f9ecb6',
    rust: '#b05a32',
    teal: '#4ab09a',
    blue: '#5ca0a8',
  },
  accent: ['#de9a49', '#4ab09a', '#b05a32', '#5ca0a8', '#803e2f'],
  white: '#ffffff',
  black: '#000000',
};

// Animation variants for framer-motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  },
  slideRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

// Transition configs
export const TRANSITIONS = {
  smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  default: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  slow: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// Firefly configuration
export const FIREFLY_CONFIG = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i * 17.3 + (i % 3) * 29) % 94 + 3,
  y: (i * 11.7 + (i % 5) * 13) % 55 + 5,
  size: 2 + (i % 3),
  delay: (i * 0.61) % 7,
  dur: 3.5 + (i % 5) * 0.6,
  driftX: ((i % 7) - 3) * 28,
  driftY: ((i % 5) - 2) * 20,
}));

// Home firefly seeds
export const HOME_FIREFLY_CONFIG = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 16.7 + (i % 4) * 19) % 96 + 2,
  y: (i * 12.1 + (i % 6) * 11) % 94 + 2,
  size: 2 + (i % 3),
  delay: (i * 0.57) % 6.5,
  dur: 3.2 + (i % 5) * 0.58,
}));

// Breakpoints
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Z-index layers
export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 9999,
};

// Navigation menu items
export const NAV_ITEMS = [
  { view: 'home' as const, label: 'Home' },
  { view: 'about' as const, label: 'Overview' },
  { view: 'major-events' as const, label: 'Featured' },
  { view: 'classes' as const, label: 'Classes' },
  { view: 'faq' as const, label: 'FAQs' },
];

// Items per page pagination
export const PAGINATION_CONFIG = {
  classesPerPage: 6,
  eventsPerPage: 12,
};
