import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ChevronRight, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { SubthemeFilterPills } from '../components/shared/SubthemeFilterPills';

/* ════════════════════════════════════════════
   SUBTHEME CONFIG — mirrors Home.tsx exactly
   ════════════════════════════════════════════ */
interface SubthemeMeta {
  key: string;
  solidColor: string;
  iconColor: string;
  borderColor: string;
  sectionBg: string;
  topBarGradient: string;
  radialGlow: string;
}

const SUBTHEMES: SubthemeMeta[] = [
  {
    key: 'all',
    solidColor: '#006937',
    iconColor: '#fae185',
    borderColor: 'rgba(250,225,133,0.45)',
    sectionBg: `linear-gradient(180deg,
      rgba(0,105,55,0.13) 0%,
      rgba(0,105,55,0.07) 35%,
      rgba(250,225,133,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(250,225,133,0.4) 15%,
      rgba(250,225,133,0.85) 50%,
      rgba(250,225,133,0.4) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,105,55,0.18) 0%, transparent 70%),
                 radial-gradient(ellipse 40% 30% at 20% 60%, rgba(250,225,133,0.08) 0%, transparent 60%)`,
  },
  {
    key: 'Palayan ng Karunungan',
    solidColor: '#C9E0E4',
    iconColor: '#C9E0E4',
    borderColor: 'rgba(201,224,228,0.3)',
    sectionBg: `linear-gradient(180deg,
      rgba(201,224,228,0.18) 0%,
      rgba(201,224,228,0.09) 35%,
      rgba(153,217,235,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(201,224,228,0.5) 15%,
      rgba(201,224,228,0.9) 50%,
      rgba(201,224,228,0.5) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,224,228,0.22) 0%, transparent 70%),
                 radial-gradient(ellipse 35% 25% at 80% 50%, rgba(153,217,235,0.1) 0%, transparent 55%)`,
  },
  {
    key: 'Pamilihan ng Kakayahan',
    solidColor: '#fae185',
    iconColor: '#fae185',
    borderColor: 'rgba(250,225,133,0.3)',
    sectionBg: `linear-gradient(180deg,
      rgba(250,225,133,0.2) 0%,
      rgba(250,225,133,0.1) 35%,
      rgba(239,230,173,0.06) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(250,225,133,0.55) 15%,
      rgba(250,225,133,0.95) 50%,
      rgba(250,225,133,0.55) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(250,225,133,0.25) 0%, transparent 70%),
                 radial-gradient(ellipse 40% 30% at 75% 40%, rgba(239,230,173,0.12) 0%, transparent 60%)`,
  },
  {
    key: 'Plaza ng Malikhaing Diwa',
    solidColor: '#8b4a06',
    iconColor: '#d4956a',
    borderColor: 'rgba(139,74,6,0.45)',
    sectionBg: `linear-gradient(180deg,
      rgba(139,74,6,0.16) 0%,
      rgba(139,74,6,0.08) 35%,
      rgba(212,149,106,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(212,149,106,0.5) 15%,
      rgba(212,149,106,0.9) 50%,
      rgba(212,149,106,0.5) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,74,6,0.2) 0%, transparent 70%),
                 radial-gradient(ellipse 45% 30% at 15% 55%, rgba(212,149,106,0.1) 0%, transparent 60%)`,
  },
  {
    key: 'Dambana ng Pagkakaisa',
    solidColor: '#16a460',
    iconColor: '#16a460',
    borderColor: 'rgba(22,164,96,0.35)',
    sectionBg: `linear-gradient(180deg,
      rgba(22,164,96,0.16) 0%,
      rgba(22,164,96,0.08) 35%,
      rgba(78,207,138,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(78,207,138,0.45) 15%,
      rgba(78,207,138,0.85) 50%,
      rgba(78,207,138,0.45) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(22,164,96,0.2) 0%, transparent 70%),
                 radial-gradient(ellipse 38% 28% at 85% 45%, rgba(78,207,138,0.1) 0%, transparent 55%)`,
  },
  {
    key: 'Palaisdaan ng Kalusugan',
    solidColor: '#99d9eb',
    iconColor: '#99d9eb',
    borderColor: 'rgba(153,217,235,0.3)',
    sectionBg: `linear-gradient(180deg,
      rgba(153,217,235,0.18) 0%,
      rgba(153,217,235,0.09) 35%,
      rgba(201,224,228,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(153,217,235,0.5) 15%,
      rgba(153,217,235,0.9) 50%,
      rgba(153,217,235,0.5) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(153,217,235,0.22) 0%, transparent 70%),
                 radial-gradient(ellipse 35% 25% at 70% 60%, rgba(201,224,228,0.1) 0%, transparent 55%)`,
  },
  {
    key: 'Bahay ng Bayanihan',
    solidColor: '#efe6ad',
    iconColor: '#efe6ad',
    borderColor: 'rgba(239,230,173,0.3)',
    sectionBg: `linear-gradient(180deg,
      rgba(239,230,173,0.2) 0%,
      rgba(239,230,173,0.1) 35%,
      rgba(250,225,133,0.05) 70%,
      rgba(255,252,243,0) 100%)`,
    topBarGradient: `linear-gradient(90deg,
      transparent 0%, rgba(239,230,173,0.5) 15%,
      rgba(239,230,173,0.92) 50%,
      rgba(239,230,173,0.5) 85%, transparent 100%)`,
    radialGlow: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(239,230,173,0.24) 0%, transparent 70%),
                 radial-gradient(ellipse 40% 28% at 25% 50%, rgba(250,225,133,0.1) 0%, transparent 60%)`,
  },
];

/* ════════════════════════════════════════════
   INTERFACES
   ════════════════════════════════════════════ */
interface LeapClass {
  id: string;
  title: string;
  org: string;
  modality: string;
  date: string;
  time: string;
  venue: string;
  slots: number;
  subtheme: string;
  image: string;
  orgLogo: string | null;
  googleFormUrl: string;
  description: string;
}

interface ClassesPageProps {
  user: FirebaseUser | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc';
  onSortChange: (sort: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc') => void;
  filteredAndSortedClasses: LeapClass[];
  uniqueDays: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  viewingClass: LeapClass | null;
  onClassSelect: (leapClass: LeapClass | null) => void;
  onSignIn: () => void;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

interface PageWrapperProps {
  children: ReactNode;
}

/* ════════════════════════════════════════════
   PAGE WRAPPER
   ════════════════════════════════════════════ */
const PageWrapper = ({ children }: PageWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      flexGrow: 1,
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </motion.div>
);

/* ════════════════════════════════════════════
   PAGE HERO
   ════════════════════════════════════════════ */
const PageHero = ({
  title,
  subtitle,
  accent,
  accentColor,
}: {
  title: string;
  subtitle: string;
  accent: string;
  accentColor: string;
}) => (
  <div
    className="page-hero"
    style={{
      paddingTop: 'clamp(6rem, 12vw, 10rem)',
      paddingBottom: 'clamp(2rem, 4vw, 4rem)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div className="page-hero-fireflies">
      <span /><span /><span /><span /><span /><span />
    </div>
    <div className="page-hero-glow" />

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: accentColor,
        marginBottom: '1rem',
        transition: 'color 0.5s ease',
      }}
    >
      {accent}
    </motion.p>
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="page-hero-title"
    >
      {title}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      className="page-hero-subtitle"
    >
      {subtitle}
    </motion.p>
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      style={{
        width: 60,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        margin: '2rem auto 0',
        transition: 'background 0.5s ease',
      }}
    />
  </div>
);

/* ════════════════════════════════════════════
   MAIN CLASSES COMPONENT
   ════════════════════════════════════════════ */
export default function Classes({
  user,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filteredAndSortedClasses,
  uniqueDays,
  selectedDay,
  onDaySelect,
  viewingClass,
  onClassSelect,
  onSignIn,
  renderClassCard,
}: ClassesPageProps) {
  const ITEMS_PER_PAGE = 6;
  const [selectedSubtheme, setSelectedSubtheme] = useState<string | null>(null);

  // Derive active subtheme meta — null → 'all'
  const activeSubtheme = SUBTHEMES.find(s => s.key === (selectedSubtheme ?? 'all')) ?? SUBTHEMES[0];

  const dateFilteredClasses = useMemo(() => {
    let result = selectedDay
      ? filteredAndSortedClasses.filter((c) => c.date === selectedDay)
      : [...filteredAndSortedClasses];

    if (selectedSubtheme) {
      result = result.filter(c =>
        c.subtheme?.trim().toLowerCase() === selectedSubtheme.trim().toLowerCase()
      );
    }

    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  }, [filteredAndSortedClasses, selectedDay, selectedSubtheme]);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, sortBy, selectedDay, selectedSubtheme]);

  const visibleClasses = dateFilteredClasses.slice(0, visibleCount);
  const hasMore = visibleCount < dateFilteredClasses.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, dateFilteredClasses.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, dateFilteredClasses.length]);

  return (
    <PageWrapper>
      <style>{`
        @keyframes catalogBgFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes leap-spin { to { transform: rotate(360deg); } }

        @media (min-width: 640px) {
          .classes-search-row { flex-direction: row !important; }
        }
        @media (max-width: 768px) {
          .classes-sticky-filter {
            top: 4.85rem !important;
            margin-bottom: 1.25rem !important;
            border-radius: 0.9rem !important;
            padding: 0.72rem !important;
          }
          .classes-date-row {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 0.2rem;
          }
          .classes-date-row::-webkit-scrollbar { display: none; }
          .classes-date-pill {
            flex: 0 0 auto;
            white-space: nowrap;
            padding: 0.48rem 0.9rem !important;
            font-size: 0.74rem !important;
          }
          .classes-sort-select { width: 100%; }
        }

        .classes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .classes-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .classes-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .classes-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.9rem;
          }
        }

        .class-list-item {
          display: flex;
          gap: 0.9rem;
          padding: 0.9rem;
          border-radius: 0.85rem;
          background: linear-gradient(135deg, rgba(255,252,241,0.96), rgba(253,247,228,0.94));
          border: 1px solid rgba(222,154,73,0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .class-list-item:active,
        .class-list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(180,120,30,0.15);
          border-color: rgba(222,154,73,0.4);
        }
        .class-list-item img {
          width: 70px; height: 70px;
          border-radius: 0.7rem; object-fit: cover; flex-shrink: 0;
        }
        .class-list-item-content {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .class-list-item-title {
          font-weight: 700; color: #3a2a10;
          font-size: 0.9rem; line-height: 1.2;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .class-list-item-org {
          font-size: 0.7rem; color: #de9a49;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .class-list-item-meta {
          font-size: 0.65rem; color: #9c7a4a;
          display: flex; gap: 0.4rem; flex-wrap: wrap;
        }

        .classes-modal-grid {
          display: grid;
          grid-template-columns: min(340px, 38%) 1fr;
          overflow: auto;
          max-height: calc(100dvh - 2rem);
          width: 100%;
        }
        @media (max-width: 640px) {
          .classes-modal-overlay { padding: 0 !important; }
          .classes-modal-panel {
            width: 100vw !important; max-height: 100dvh !important;
            height: 100dvh !important; border-radius: 0 !important; border: none !important;
          }
          .classes-modal-grid {
            display: flex; flex-direction: column;
            overflow: auto; max-height: 100dvh;
          }
          .modal-image { min-height: 200px !important; max-height: 240px !important; order: -1 !important; }
          .classes-modal-detail { padding: 1rem 0.95rem 1.2rem !important; overflow-y: auto; }
          .classes-modal-meta { grid-template-columns: 1fr !important; }
          .classes-modal-cta { width: 100% !important; }
        }
      `}</style>

      {/* ── HERO — with themed accent color ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          // Base
          background: '#f5f3ec',
        }}
      >
        {/* Themed radial glow behind hero */}
        <div
          key={`hero-glow-${activeSubtheme.key}`}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: activeSubtheme.radialGlow,
            animation: 'catalogBgFade 0.6s ease forwards',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <PageHero
            title="All Classes"
            subtitle="Choose from 200+ workshops, talks, and experiences"
            accent="LEAP 2026 · Class Catalog"
            accentColor={activeSubtheme.iconColor}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minHeight: '100vh',
          padding: '0 clamp(0.75rem, 3vw, 1.5rem) clamp(4.1rem, 8vw, 6rem)',
          // Base warm parchment
          background: '#fdf8ed',
          position: 'relative',
        }}
      >
        {/* ── Layered theme backgrounds — same 3-layer system as Home ── */}

        {/* Layer 1: directional gradient */}
        <div
          key={`bg-grad-${activeSubtheme.key}`}
          style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: activeSubtheme.sectionBg,
            animation: 'catalogBgFade 0.55s ease forwards',
          }}
        />

        {/* Layer 2: radial glows */}
        <div
          key={`bg-glow-${activeSubtheme.key}`}
          style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: activeSubtheme.radialGlow,
            animation: 'catalogBgFade 0.65s ease forwards',
          }}
        />

        {/* Layer 3: dot-matrix texture */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.018,
            backgroundImage: 'radial-gradient(circle, #6b4c1e 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Top accent bar */}
        <div
          key={`top-bar-${activeSubtheme.key}`}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 1,
            background: activeSubtheme.topBarGradient,
            animation: 'catalogBgFade 0.4s ease forwards',
          }}
        />

        {/* ── All content above bg layers ── */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '72rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* ── NOT SIGNED IN ── */}
          {!user ? (
            <div
              className="leap-info-card"
              style={{
                padding: 'clamp(2rem, 5vw, 3rem)',
                borderRadius: '1.5rem',
                textAlign: 'center',
                maxWidth: '36rem',
                margin: '3rem auto',
              }}
            >
              <div
                className="leap-detail-icon-wrap"
                style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}
              >
                <Info size={32} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                  fontWeight: 700,
                  color: '#334b46',
                  marginBottom: '0.75rem',
                }}
              >
                Sign in to browse classes
              </h3>
              <p style={{ color: '#7c6b4b', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7 }}>
                You must be signed in with your DLSU account to view and register for LEAP classes.
              </p>
              <button
                onClick={onSignIn}
                className="btn-leap-primary"
                style={{ padding: '0.95rem 2.5rem', borderRadius: '1rem', fontSize: '1rem' }}
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <>
              {/* ── SEARCH & FILTER ── */}
              <section
                id="classes-sticky-filters"
                className="classes-sticky-filter"
                style={{
                  position: 'sticky',
                  top: '5.35rem',
                  zIndex: 45,
                  padding: 'clamp(0.9rem, 2.2vw, 1.25rem)',
                  borderRadius: '1rem',
                  background: 'linear-gradient(145deg, rgba(255,252,241,0.96), rgba(253,247,228,0.94))',
                  border: `1px solid ${activeSubtheme.borderColor}`,
                  boxShadow: '0 14px 34px rgba(51,75,70,0.08), inset 0 1px 0 rgba(255,255,255,0.84)',
                  backdropFilter: 'blur(8px)',
                  marginBottom: '2rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.5s ease',
                }}
              >
                {/* Top accent line on filter panel */}
                <div style={{
                  position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
                  borderRadius: '0 0 2px 2px',
                  background: `linear-gradient(90deg, transparent, ${activeSubtheme.iconColor}99, ${activeSubtheme.iconColor}ee, ${activeSubtheme.iconColor}99, transparent)`,
                  transition: 'background 0.5s ease',
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <div
                      className="classes-search-row"
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}
                    >
                      <div style={{ position: 'relative', flexGrow: 1, minWidth: 0 }}>
                        <Search
                          style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#7c6b4b',
                            pointerEvents: 'none',
                          }}
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Search classes, orgs, or topics…"
                          className="leap-search"
                          style={{
                            width: '100%',
                            paddingLeft: '3rem', paddingRight: '1rem',
                            paddingTop: '0.875rem', paddingBottom: '0.875rem',
                            boxSizing: 'border-box',
                          }}
                          value={searchQuery}
                          onChange={(e) => onSearchChange(e.target.value)}
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          onSortChange(e.target.value as 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc')
                        }
                        aria-label="Sort classes"
                        className="leap-select classes-sort-select"
                        style={{ padding: '0.875rem 1.25rem', flexShrink: 0, boxSizing: 'border-box' }}
                      >
                        <option value="title-asc">Title (A–Z)</option>
                        <option value="title-desc">Title (Z–A)</option>
                        <option value="slots-desc">Most Slots</option>
                        <option value="slots-asc">Fewest Slots</option>
                      </select>
                    </div>
                  </div>

                  {/* Date filter pills */}
                  <div style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', width: '100%',
                  }}>
                    <div
                      className="classes-date-row"
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1, minWidth: 0 }}
                    >
                      <button
                        className="classes-date-pill"
                        onClick={() => onDaySelect(null)}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '999px',
                          fontSize: '0.8rem', fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                          background: selectedDay === null ? activeSubtheme.iconColor : 'rgba(249,236,182,0.5)',
                          color: selectedDay === null ? '#1a1008' : '#7c6b4b',
                        }}
                      >
                        All Dates
                      </button>
                      {uniqueDays.map((day) => (
                        <button
                          key={day}
                          className="classes-date-pill"
                          onClick={() => onDaySelect(day)}
                          style={{
                            padding: '0.4rem 1rem', borderRadius: '999px',
                            fontSize: '0.8rem', fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                            background: selectedDay === day ? activeSubtheme.iconColor : 'rgba(249,236,182,0.5)',
                            color: selectedDay === day ? '#1a1008' : '#7c6b4b',
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* View toggle — mobile only */}
                    {isMobile && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        {(['grid', 'list'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            title={`${mode} view`}
                            style={{
                              width: 36, height: 36, padding: '0.5rem',
                              borderRadius: '0.6rem',
                              border: viewMode === mode
                                ? `1.5px solid ${activeSubtheme.iconColor}`
                                : '1px solid rgba(210,175,110,0.3)',
                              background: viewMode === mode
                                ? `${activeSubtheme.solidColor}22`
                                : 'transparent',
                              cursor: 'pointer', transition: 'all 0.18s',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: viewMode === mode ? activeSubtheme.iconColor : '#9c7a4a',
                            }}
                          >
                            {mode === 'grid' ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="1" width="6" height="6" />
                                <rect x="9" y="1" width="6" height="6" />
                                <rect x="1" y="9" width="6" height="6" />
                                <rect x="9" y="9" width="6" height="6" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="14" height="2" />
                                <rect x="1" y="7" width="14" height="2" />
                                <rect x="1" y="12" width="14" height="2" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── SUBTHEME FILTER PILLS ── */}
              <SubthemeFilterPills
                selectedSubtheme={selectedSubtheme}
                isMobile={isMobile}
                onSubthemeSelect={(val) => setSelectedSubtheme(val)}
              />

              <div style={{ height: '0.5rem' }} />

              {/* ── RESULTS COUNT ── */}
              <div style={{ marginBottom: '2.5rem', marginTop: '1rem', textAlign: 'center' }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem', color: '#7c6b4b', fontWeight: 500,
                }}>
                  Showing {visibleClasses.length} of {dateFilteredClasses.length} classes
                </p>
              </div>

              {/* ── CLASSES GRID / LIST ── */}
              {viewMode === 'grid' ? (
                <motion.div
                  key={`grid-${selectedSubtheme ?? 'all'}-${selectedDay ?? 'all'}`}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="classes-grid"
                  style={{ marginBottom: '2rem', minHeight: '400px' }}
                >
                  {visibleClasses.length > 0
                    ? visibleClasses.map((item, index) => renderClassCard(item, index))
                    : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          gridColumn: '1 / -1', textAlign: 'center',
                          padding: '4rem 1rem', display: 'flex',
                          flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        }}
                      >
                        <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.35 }}>
                          <g transform="translate(24,24)">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
                              const r = (ang * Math.PI) / 180;
                              return (
                                <line key={i}
                                  x1={Math.cos(r) * 8} y1={Math.sin(r) * 8}
                                  x2={Math.cos(r) * 18} y2={Math.sin(r) * 18}
                                  stroke={activeSubtheme.iconColor} strokeWidth="2" strokeLinecap="round"
                                />
                              );
                            })}
                            <circle r="7" fill="none" stroke={activeSubtheme.iconColor} strokeWidth="1.5" />
                            <circle r="3" fill={`${activeSubtheme.solidColor}66`} />
                          </g>
                        </svg>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', color: '#7c6b4b', fontWeight: 600 }}>
                          No classes in this subtheme yet.
                        </p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#9c7a4a', lineHeight: 1.6, maxWidth: 320 }}>
                          Try selecting a different subtheme or browse all classes.
                        </p>
                      </motion.div>
                    )
                  }
                </motion.div>
              ) : (
                <motion.div
                  key={`list-${selectedSubtheme ?? 'all'}-${selectedDay ?? 'all'}`}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '2rem', minHeight: '400px' }}
                >
                  {visibleClasses.map((item) => (
                    <div
                      key={item.id}
                      className="class-list-item"
                      onClick={() => onClassSelect(item)}
                    >
                      <img src={item.image} alt={item.title} referrerPolicy="no-referrer" />
                      <div className="class-list-item-content">
                        <div className="class-list-item-title">{item.title}</div>
                        <div className="class-list-item-org">{item.org}</div>
                        <div className="class-list-item-meta">
                          <span>📅 {item.date}</span>
                          <span>🕐 {item.time}</span>
                          <span>👥 {item.slots}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── INFINITE SCROLL SENTINEL ── */}
              <div ref={sentinelRef} style={{ height: 1 }} />
              {hasMore && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{
                    width: 32, height: 32,
                    border: `3px solid ${activeSubtheme.solidColor}44`,
                    borderTopColor: activeSubtheme.iconColor,
                    borderRadius: '50%',
                    animation: 'leap-spin 0.7s linear infinite',
                    margin: '0 auto',
                  }} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── CLASS DETAIL MODAL ── */}
      {user && viewingClass && (
        <motion.div
          className="classes-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClassSelect(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            height: '100dvh', overflow: 'hidden',
            background: 'rgba(8,10,8,0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: 'clamp(0.5rem, 2vw, 1.5rem)',
            display: 'grid', placeItems: 'center',
          }}
        >
          <motion.div
            className="classes-modal-panel"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fffdf6',
              border: '1px solid rgba(224,183,136,0.34)',
              borderRadius: 18,
              boxShadow: '0 24px 64px rgba(51,75,70,0.18)',
              width: 'min(1040px, 96vw)',
              maxHeight: 'calc(100dvh - 2rem)',
              overflow: 'auto',
              position: 'relative',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Themed accent bar at top of modal */}
            {(() => {
              const modalSubtheme = SUBTHEMES.find(s => s.key === viewingClass.subtheme) ?? SUBTHEMES[0];
              return (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 10,
                  background: modalSubtheme.topBarGradient,
                  borderRadius: '18px 18px 0 0',
                }} />
              );
            })()}

            {/* Close button */}
            <button
              onClick={() => onClassSelect(null)}
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 10,
                background: 'rgba(255,252,241,0.96)',
                border: '1px solid rgba(224,183,136,0.3)',
                borderRadius: '999px', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#334b46',
                boxShadow: '0 2px 8px rgba(51,75,70,0.12)',
                transition: 'background 0.2s',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="classes-modal-grid">
              {/* Image panel */}
              <div
                className="modal-image"
                style={{ position: 'relative', minHeight: 260, overflow: 'hidden', flexShrink: 0 }}
              >
                <img
                  src={viewingClass.image}
                  alt={viewingClass.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  referrerPolicy="no-referrer"
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)',
                }} />
                <div style={{
                  position: 'absolute', top: '1.25rem', left: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {viewingClass.orgLogo && (
                    <img
                      src={viewingClass.orgLogo ?? undefined}
                      alt={viewingClass.org}
                      style={{
                        width: 32, height: 32, borderRadius: 6, objectFit: 'cover',
                        border: '2px solid rgba(222,154,73,0.5)',
                      }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {viewingClass.subtheme && (
                    <span className="leap-detail-badge">{viewingClass.subtheme}</span>
                  )}
                </div>
              </div>

              {/* Detail panel */}
              <div
                className="classes-modal-detail"
                style={{
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                  overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
                }}
              >
                <div>
                  <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
                    fontWeight: 800, color: '#334b46', lineHeight: 1.1, marginBottom: '0.5rem',
                  }}>
                    {viewingClass.title}
                  </h1>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b05a32',
                  }}>
                    Organized by {viewingClass.org}
                  </p>
                </div>

                {/* Metadata grid */}
                <div
                  className="classes-modal-meta"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}
                >
                  {[
                    { Icon: Calendar, label: 'Date & Time', val: `${viewingClass.date} · ${viewingClass.time}` },
                    { Icon: MapPin, label: 'Location', val: `${viewingClass.venue} (${viewingClass.modality})` },
                    { Icon: Users, label: 'Slots', val: `${viewingClass.slots} participants` },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>
                          {label}
                        </p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>
                          {val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ borderTop: '1px solid rgba(229,207,171,0.6)', paddingTop: '1rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#334b46', marginBottom: '0.6rem' }}>
                    About this class
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(51,75,70,0.8)' }}>
                    {viewingClass.description || 'No description provided.'}
                  </p>
                </div>

                {/* CTA */}
                <div style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                  <a
                    href={viewingClass.googleFormUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-leap-primary classes-modal-cta"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.9rem 2rem', borderRadius: '0.75rem',
                      fontSize: '0.9rem', textDecoration: 'none',
                    }}
                  >
                    Register Now <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageWrapper>
  );
}