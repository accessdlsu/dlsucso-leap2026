/**
 * QUICK START GUIDE - Common Imports & Usage Patterns
 * 
 * Copy-paste these examples to quickly use the modular architecture
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS - Get and track data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EXAMPLE 1: Get window size and check if mobile
// import { useWindowWidth, useIsMobile } from '~/hooks';
//
// function MyComponent() {
//   const width = useWindowWidth();
//   const isMobile = useIsMobile();
//
//   return isMobile ? <MobileLayout /> : <DesktopLayout />;
// }

// EXAMPLE 2: Get scroll progress
// import { useScrollProgress } from '~/hooks';
//
// function AnimatedHeader() {
//   const progress = useScrollProgress(); // 0 to 1
//
//   return (
//     <header style={{ opacity: progress }}>
//       You've scrolled {Math.round(progress * 100)}%
//     </header>
//   );
// }

// EXAMPLE 3: Fetch main events
// import { useMainEvents } from '~/hooks';
//
// function EventsList() {
//   const { events, loading, error } = useMainEvents();
//
//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//
//   return events.map(e => <EventCard key={e.id} event={e} />);
// }

// EXAMPLE 4: Filter and sort classes
// import { useFilteredClasses } from '~/hooks';
//
// function ClassCatalog({ classes, query, sortBy }) {
//   const filtered = useFilteredClasses(classes, query, sortBy);
//
//   return filtered.map(c => <ClassCard key={c.id} class={c} />);
// }

// EXAMPLE 5: Authentication
// import { useAuth } from '~/hooks';
//
// function UserProfile() {
//   const { user, userProfile, loading, handleSignOut } = useAuth();
//
//   if (loading) return <Spinner />;
//   if (!user) return <LoginButton />;
//
//   return (
//     <>
//       <h1>{user.displayName}</h1>
//       <button onClick={handleSignOut}>Sign Out</button>
//     </>
//   );
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS - Colors, sizes, animations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EXAMPLE 1: Use brand colors
// import { COLORS } from '~/utils';
//
// const style = {
//   color: COLORS.leap.gold,           // '#de9a49'
//   background: COLORS.leap.dark,      // '#334b46'
//   borderColor: COLORS.accent[0],      // '#de9a49'
// };

// EXAMPLE 2: Check responsive breakpoints
// import { useWindowWidth } from '~/hooks';
// import { BREAKPOINTS } from '~/utils';
//
// function ResponsiveLayout() {
//   const width = useWindowWidth();
//
//   if (width < BREAKPOINTS.md) return <MobileLayout />;
//   if (width < BREAKPOINTS.lg) return <TabletLayout />;
//   return <DesktopLayout />;
// }

// EXAMPLE 3: Use animation presets
// import { motion } from 'framer-motion';
// import { ANIMATION_VARIANTS, TRANSITIONS } from '~/utils';
//
// function AnimatedBox() {
//   return (
//     <motion.div
//       initial={ANIMATION_VARIANTS.slideUp.initial}
//       animate={ANIMATION_VARIANTS.slideUp.animate}
//       transition={TRANSITIONS.default}
//     >
//       Animated content
//     </motion.div>
//   );
// }

// EXAMPLE 4: Use navigation items
// import { NAV_ITEMS } from '~/utils';
//
// function Navigation() {
//   return (
//     <nav>
//       {NAV_ITEMS.map(item => (
//         <a key={item.view} href={`/${item.view}`}>
//           {item.label}
//         </a>
//       ))}
//     </nav>
//   );
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS - Utility functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EXAMPLE 1: Scroll to element
// import { scrollToElement } from '~/utils';
//
// function TableOfContents() {
//   return (
//     <ul>
//       <li>
//         <button onClick={() => scrollToElement('section-1')}>
//           Go to Section 1
//         </button>
//       </li>
//     </ul>
//   );
// }

// EXAMPLE 2: Format dates
// import { formatDate, formatTime } from '~/utils';
//
// function EventInfo({ event }) {
//   return (
//     <div>
//       <p>Date: {formatDate(event.date)}</p>
//       <p>Time: {formatTime(event.time)}</p>
//     </div>
//   );
// }

// EXAMPLE 3: Debounce search
// import { debounce } from '~/utils';
//
// function SearchInput() {
//   const handleSearch = debounce((query) => {
//     // Fetch results for query
//     console.log('Searching:', query);
//   }, 300);
//
//   return (
//     <input
//       type="text"
//       onChange={(e) => handleSearch(e.target.value)}
//     />
//   );
// }

// EXAMPLE 4: Manage body overflow (for modals)
// import { setBodyOverflow } from '~/utils';
// import { useState } from 'react';
//
// function Modal() {
//   const [open, setOpen] = useState(false);
//
//   const handleOpen = () => {
//     setOpen(true);
//     setBodyOverflow(true);
//   };
//
//   const handleClose = () => {
//     setOpen(false);
//     setBodyOverflow(false);
//   };
//
//   return (
//     <>
//       <button onClick={handleOpen}>Open Modal</button>
//       {open && (
//         <div>
//           <h2>Modal Content</h2>
//           <button onClick={handleClose}>Close</button>
//         </div>
//       )}
//     </>
//   );
// }

// EXAMPLE 5: Truncate text
// import { truncateText } from '~/utils';
//
// function Description({ text }) {
//   return <p>{truncateText(text, 100)}</p>;
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES - Type definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EXAMPLE 1: Properly type components
// import type { LeapClass, UserProfile } from '~/types';
//
// interface ClassCardProps {
//   class: LeapClass;
//   onSelect?: (class: LeapClass) => void;
// }
//
// function ClassCard({ class: classItem, onSelect }: ClassCardProps) {
//   return (
//     <div onClick={() => onSelect?.(classItem)}>
//       <h3>{classItem.title}</h3>
//       <p>{classItem.description}</p>
//     </div>
//   );
// }

// EXAMPLE 2: Type your component props correctly
// import type { ViewType, SortOption } from '~/types';
//
// interface DashboardProps {
//   currentView: ViewType;
//   sortBy: SortOption;
//   onViewChange: (view: ViewType) => void;
// }
//
// function Dashboard({ currentView, sortBy, onViewChange }: DashboardProps) {
//   return <div>View: {currentView}</div>;
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED COMPONENTS - Reusable UI components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EXAMPLE 1: Use scroll progress bar
// import { ScrollProgress } from '~/components/shared';
//
// function App() {
//   return (
//     <>
//       <ScrollProgress />
//       {/* Rest of app */}
//     </>
//   );
// }

// EXAMPLE 2: Use fireflies animation
// import { Fireflies, PageHeroFireflies } from '~/components/shared';
//
// function HeroSection() {
//   return (
//     <div style={{ position: 'relative' }}>
//       <Fireflies />
//       <h1>Welcome to LEAP 2026</h1>
//     </div>
//   );
// }
//
// function PageHero() {
//   return (
//     <div className="page-hero">
//       <PageHeroFireflies />
//       <h1>Page Title</h1>
//     </div>
//   );
// }

// EXAMPLE 3: Use cinematic scroll effect
// import { TheAwakening } from '~/components/shared';
//
// function HomePage() {
//   return (
//     <>
//       <TheAwakening />
//       <main>Rest of page</main>
//     </>
//   );
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPLETE EXAMPLE - A full page component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
import { useWindowWidth, useMainEvents } from '~/hooks';
import { COLORS, BREAKPOINTS, scrollToElement } from '~/utils';
import type { MainEvent } from '~/types';

function MainEventsPage() {
  const width = useWindowWidth();
  const { events, loading } = useMainEvents();
  const isMobile = width < BREAKPOINTS.md;

  if (loading) return <div>Loading events...</div>;

  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
      <h1 style={{ color: COLORS.leap.gold }}>Featured Events</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '2rem',
      }}>
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => scrollToElement(`event-${event.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event, onClick }: { event: MainEvent; onClick: () => void }) {
  return (
    <div
      id={`event-${event.id}`}
      onClick={onClick}
      style={{
        background: COLORS.leap.cream,
        borderLeft: `4px solid ${event.accent}`,
        padding: '1.5rem',
        cursor: 'pointer',
      }}
    >
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <small>{event.date} at {event.time}</small>
    </div>
  );
}

export default MainEventsPage;
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORT ALIASES (if using tsconfig.json path aliases)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
To use shorter imports like "import { ... } from '~/hooks'",
add this to tsconfig.json:

{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}

Then import like:
- import { useWindowWidth } from '~/hooks';
- import { COLORS } from '~/utils';
- import type { LeapClass } from '~/types';
- import { Fireflies } from '~/components/shared';

Instead of:
- import { useWindowWidth } from './hooks/useWindow';
- import { COLORS } from './utils/constants';
- import type { LeapClass } from './types/index';
- import { Fireflies } from './components/shared/Fireflies';
*/
