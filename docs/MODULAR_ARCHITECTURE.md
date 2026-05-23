# Modular Architecture Guide

This document describes the new modular structure implemented in the LEAP 2026 project.

## Directory Structure

```
src/
├── hooks/                    # Custom React hooks
│   ├── useWindow.ts         # Window size and scroll tracking
│   ├── useData.ts           # Data fetching and filtering
│   ├── useAuth.ts           # Authentication state management
│   └── index.ts             # Hook exports
├── types/                    # TypeScript type definitions
│   └── index.ts             # Shared types and interfaces
├── utils/                    # Utility functions and constants
│   ├── constants.ts         # Color palette, animation configs, breakpoints
│   ├── helpers.ts           # Helper functions (scroll, format, etc.)
│   └── index.ts             # Utility exports
├── components/
│   ├── shared/              # Reusable shared components
│   │   ├── Fireflies.tsx    # Firefly animation
│   │   ├── TheAwakening.tsx # Cinematic scroll scene
│   │   ├── ScrollProgress.tsx # Progress bar
│   │   └── index.ts
│   ├── ClassCard.tsx        # Class card component
│   ├── Footer.tsx           # Footer component
│   ├── Navbar.tsx           # Navigation bar
│   └── PageCommon.tsx       # Page wrapper and hero
├── pages/                    # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Classes.tsx
│   ├── MainEvents.tsx
│   ├── FAQs.tsx
│   └── index_patches.css
├── services/                 # External service integrations
│   ├── contentful.ts
│   └── firebase.ts
├── App.tsx                  # Main application component
├── App.module.css           # App styles
├── index.css                # Global styles
└── main.tsx
```

## Key Modules

### 1. Hooks (`/src/hooks/`)

#### useWindow.ts
- `useWindowWidth()` - Get current window width, updates on resize
- `useIsMobile()` - Check if window is mobile size
- `useParallaxMouse()` - Parallax mouse movement effect
- `useScrollProgress()` - Track scroll progress (0-1)
- `useScrollVisibility()` - Track element visibility during scroll

#### useData.ts
- `useMainEvents()` - Fetch main events from Contentful
- `useFilteredClasses()` - Filter and sort leap classes
- `useUniqueDays()` - Get unique days from classes

#### useAuth.ts
- `useAuth()` - Manage authentication state and user profile
  - Returns: `{ user, userProfile, loading, error, handleSignOut }`

### 2. Types (`/src/types/`)

All TypeScript interfaces and types are centralized:
- `ViewType` - Page view types
- `SortOption` - Sort options
- `LeapClass` - Class data structure
- `UserProfile` - User profile structure
- `MainEvent` - Main event structure
- `NavigationProps` - Navigation component props

### 3. Utils (`/src/utils/`)

#### constants.ts
- `COLORS` - Brand color palette
- `ANIMATION_VARIANTS` - Framer Motion animation presets
- `TRANSITIONS` - Animation timing configs
- `FIREFLY_CONFIG` - Firefly animation data
- `BREAKPOINTS` - Responsive design breakpoints
- `NAV_ITEMS` - Navigation menu items
- `PAGINATION_CONFIG` - Pagination settings

#### helpers.ts
- `scrollToElement()` - Smooth scroll to element
- `scrollToTop()` - Scroll to page top
- `setBodyOverflow()` - Manage body overflow
- `formatDate()` - Format date strings
- `formatTime()` - Format time strings
- `debounce()` - Debounce function
- `throttle()` - Throttle function
- `classNames()` - Conditional class names
- `isMobileScreen()` - Check if mobile
- `extractImageUrl()` - Extract Contentful image URL
- `truncateText()` - Truncate text with ellipsis
- And more utility functions...

### 4. Shared Components (`/src/components/shared/`)

#### Fireflies.tsx
```tsx
<Fireflies />           // Full fireflies animation
<PageHeroFireflies />   // Simple page hero fireflies
```

#### TheAwakening.tsx
Cinematic dawn transition scene with:
- Stars that fade with scroll
- Growing sun effect
- Light rays that intensify
- Scroll hint animation

#### ScrollProgress.tsx
Top-of-page scroll progress indicator

## Usage Examples

### Using Hooks

```tsx
import { useWindowWidth, useScrollProgress, useMainEvents } from '~/hooks';

function MyComponent() {
  const width = useWindowWidth();
  const progress = useScrollProgress();
  const { events, loading } = useMainEvents();

  if (loading) return <div>Loading...</div>;
  
  return <div>{events.length} events</div>;
}
```

### Using Constants

```tsx
import { COLORS, ANIMATION_VARIANTS, BREAKPOINTS } from '~/utils';

const style = {
  color: COLORS.leap.gold,
  background: COLORS.accent[0],
};

if (width < BREAKPOINTS.md) {
  // Mobile layout
}
```

### Using Helpers

```tsx
import { scrollToElement, formatDate, debounce } from '~/utils';

button.onClick = () => scrollToElement('target-section');

const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);
```

### Using Types

```tsx
import type { LeapClass, UserProfile, ViewType } from '~/types';

function ClassCard(props: { class: LeapClass }) {
  return <div>{props.class.title}</div>;
}
```

### Using Shared Components

```tsx
import { Fireflies, ScrollProgress, TheAwakening } from '~/components/shared';

function App() {
  return (
    <>
      <ScrollProgress />
      <TheAwakening />
      <Fireflies />
    </>
  );
}
```

## Benefits of This Structure

1. **Separation of Concerns** - Business logic, types, and UI are separated
2. **Reusability** - Hooks and utilities can be used across components
3. **Maintainability** - Easy to find and update specific functionality
4. **Testability** - Hooks and utilities can be tested independently
5. **Scalability** - Easy to add new components, hooks, and utilities
6. **Type Safety** - Centralized types prevent inconsistencies
7. **Performance** - Custom hooks prevent unnecessary re-renders
8. **Consistency** - Shared constants ensure consistent styling and behavior

## Migration Notes

When refactoring components:
1. Extract reusable logic into custom hooks
2. Define component props using types from `/types/`
3. Use constants from `/utils/constants.ts`
4. Use helper functions from `/utils/helpers.ts`
5. Import shared components from `/components/shared/`
6. Keep page-specific components in `/pages/`
7. Keep component-specific styles in component-level CSS modules

## Next Steps

Consider additional modularization:
1. Create Navigation and MobileMenu components
2. Extract MainEventsSection into separate component
3. Create AdminDashboard component
4. Extract Contact form into component
5. Create Footer component
6. Create ClassCard, EventCard, and other specific components
7. Add unit tests for hooks and utilities
8. Consider state management (Context API or Zustand) for global state
