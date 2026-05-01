import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ChevronRight, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';


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
  SUBTHEME FILTER PILLS
  ════════════════════════════════════════════ */
const SubthemeFilterPills = ({
  selectedSubtheme,
  onSubthemeSelect,
}: {
  selectedSubtheme: string | null;
  onSubthemeSelect: (subtheme: string | null) => void;
  isMobile: boolean;
}) => {
  const SUBTHEMES = [
    {
      key: 'Palayan ng Karunungan',
      label: 'Karunungan',
      shortLabel: 'Palayan ng\nKarunungan',
      emoji: '📚',
      icon: '◈',
      bg: 'linear-gradient(135deg, #C9E0E4 0%, #8ab8c0 100%)',
      bgIdle: 'rgba(201,224,228,0.12)',
      border: 'rgba(201,224,228,0.35)',
      borderActive: '#C9E0E4',
      text: '#5a9aa8',
      textActive: '#0f3a42',
      glow: 'rgba(201,224,228,0.5)',
      dot: '#C9E0E4',
      accent: '#8ab8c0',
    },
    {
      key: 'Pamilihan ng Kakayahan',
      label: 'Kakayahan',
      shortLabel: 'Pamilihan ng\nKakayahan',
      emoji: '🔧',
      icon: '◆',
      bg: 'linear-gradient(135deg, #fae185 0%, #d4a838 100%)',
      bgIdle: 'rgba(250,225,133,0.12)',
      border: 'rgba(250,225,133,0.3)',
      borderActive: '#fae185',
      text: '#9a7010',
      textActive: '#2a1a00',
      glow: 'rgba(250,225,133,0.55)',
      dot: '#fae185',
      accent: '#d4a838',
    },
    {
      key: 'Plaza ng Malikhaing Diwa',
      label: 'Malikhaing Diwa',
      shortLabel: 'Plaza ng\nMalikhaing Diwa',
      emoji: '🎨',
      icon: '◉',
      bg: 'linear-gradient(135deg, #d4956a 0%, #9a5828 100%)',
      bgIdle: 'rgba(212,149,106,0.12)',
      border: 'rgba(212,149,106,0.35)',
      borderActive: '#d4956a',
      text: '#8a4818',
      textActive: '#2a1008',
      glow: 'rgba(212,149,106,0.5)',
      dot: '#d4956a',
      accent: '#c07840',
    },
    {
      key: 'Dambana ng Pagkakaisa',
      label: 'Pagkakaisa',
      shortLabel: 'Dambana ng\nPagkakaisa',
      emoji: '🤝',
      icon: '◎',
      bg: 'linear-gradient(135deg, #4ecf8a 0%, #16a460 100%)',
      bgIdle: 'rgba(78,207,138,0.1)',
      border: 'rgba(78,207,138,0.3)',
      borderActive: '#4ecf8a',
      text: '#0e6838',
      textActive: '#042818',
      glow: 'rgba(78,207,138,0.45)',
      dot: '#4ecf8a',
      accent: '#2ab870',
    },
    {
      key: 'Palaisdaan ng Kalusugan',
      label: 'Kalusugan',
      shortLabel: 'Palaisdaan ng\nKalusugan',
      emoji: '💙',
      icon: '◇',
      bg: 'linear-gradient(135deg, #99d9eb 0%, #4ab0c8 100%)',
      bgIdle: 'rgba(153,217,235,0.12)',
      border: 'rgba(153,217,235,0.3)',
      borderActive: '#99d9eb',
      text: '#2a7a98',
      textActive: '#042838',
      glow: 'rgba(153,217,235,0.5)',
      dot: '#99d9eb',
      accent: '#6ac0d8',
    },
    {
      key: 'Bahay ng Bayanihan',
      label: 'Bayanihan',
      shortLabel: 'Bahay ng\nBayanihan',
      emoji: '🏡',
      icon: '◐',
      bg: 'linear-gradient(135deg, #efe6ad 0%, #c8b060 100%)',
      bgIdle: 'rgba(239,230,173,0.12)',
      border: 'rgba(239,230,173,0.3)',
      borderActive: '#efe6ad',
      text: '#8a7010',
      textActive: '#281e00',
      glow: 'rgba(239,230,173,0.5)',
      dot: '#efe6ad',
      accent: '#d4c070',
    },
  ];

  return (
    <div style={{
      marginBottom: '1.75rem',
      position: 'relative',
    }}>
      {/* Ornamental header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          flex: '0 1 60px',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.5))',
        }} />
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#de9a49',
          margin: 0,
          whiteSpace: 'nowrap',
        }}>✦ Filter by Subtheme ✦</p>
        <span style={{
          flex: '0 1 60px',
          height: 1,
          background: 'linear-gradient(90deg, rgba(222,154,73,0.5), transparent)',
        }} />
      </div>

      {/* Pills container */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(255,252,241,0.92), rgba(253,247,228,0.88))',
        borderRadius: '1.5rem',
        border: '1px solid rgba(222,154,73,0.22)',
        boxShadow: '0 8px 32px rgba(51,75,70,0.07), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(222,154,73,0.08)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background palay ornament */}
        <svg
          style={{ position: 'absolute', right: 16, top: 8, opacity: 0.07, pointerEvents: 'none' }}
          width="60" height="80" viewBox="0 0 60 80"
        >
          <path d="M30 80 Q28 55 26 35 Q24 18 30 4" stroke="#de9a49" strokeWidth="2" fill="none" strokeLinecap="round" />
          {[4, 15, 26, 37, 48, 59].map((y, i) => (
            <ellipse key={i} cx={30 + (i % 2 === 0 ? -5 : 5)} cy={y} rx="5" ry="8"
              fill="#de9a49" transform={`rotate(${i % 2 === 0 ? -20 : 20}, ${30 + (i % 2 === 0 ? -5 : 5)}, ${y})`} />
          ))}
        </svg>
        <svg
          style={{ position: 'absolute', left: 16, top: 8, opacity: 0.07, pointerEvents: 'none', transform: 'scaleX(-1)' }}
          width="60" height="80" viewBox="0 0 60 80"
        >
          <path d="M30 80 Q28 55 26 35 Q24 18 30 4" stroke="#de9a49" strokeWidth="2" fill="none" strokeLinecap="round" />
          {[4, 15, 26, 37, 48, 59].map((y, i) => (
            <ellipse key={i} cx={30 + (i % 2 === 0 ? -5 : 5)} cy={y} rx="5" ry="8"
              fill="#de9a49" transform={`rotate(${i % 2 === 0 ? -20 : 20}, ${30 + (i % 2 === 0 ? -5 : 5)}, ${y})`} />
          ))}
        </svg>

        {/* ALL CLASSES pill */}
        <button
          onClick={() => onSubthemeSelect(null)}
          style={{
            position: 'relative',
            padding: '0.6rem 1.4rem',
            borderRadius: 999,
            background: selectedSubtheme === null
              ? 'linear-gradient(135deg, #006937 0%, #004d28 100%)'
              : '#ffffff',
            border: `2px solid ${selectedSubtheme === null ? '#006937' : 'rgba(0,105,55,0.3)'}`,
            color: selectedSubtheme === null ? '#fae185' : '#006937',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
            textTransform: 'uppercase',
            boxShadow: selectedSubtheme === null
              ? '0 4px 18px rgba(0,105,55,0.4), inset 0 1px 0 rgba(255,255,255,0.18)'
              : 'none',
            transform: selectedSubtheme === null ? 'translateY(-2px) scale(1.04)' : 'translateY(0) scale(1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
            minHeight: 40,
          }}
        >
          {selectedSubtheme === null && (
            <span style={{
              position: 'absolute', inset: 0, borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
          )}
          <svg width="10" height="10" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
            <g transform="translate(6,6)">
              {[0, 60, 120, 180, 240, 300].map((a, i) => {
                const r = a * Math.PI / 180;
                return <line key={i} x1={Math.cos(r) * 2} y1={Math.sin(r) * 2} x2={Math.cos(r) * 5} y2={Math.sin(r) * 5}
                  stroke={selectedSubtheme === null ? '#fae185' : '#4a7a54'} strokeWidth="1.2" strokeLinecap="round" />;
              })}
              <circle r="1.5" fill={selectedSubtheme === null ? '#fae185' : '#4a7a54'} />
            </g>
          </svg>
          All Classes
        </button>

        {/* Vertical divider */}
        <div style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'rgba(222,154,73,0.2)',
          margin: '0.25rem 0.1rem',
          flexShrink: 0,
        }} />

        {/* Subtheme pills */}
        {SUBTHEMES.map((s) => {
          const isActive = selectedSubtheme === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onSubthemeSelect(isActive ? null : s.key)}
              title={s.key}
              style={{
                position: 'relative',
                padding: '0.55rem 1.1rem',
                borderRadius: 999,
                background: isActive ? s.bg : '#ffffff',
                border: `2px solid ${isActive ? s.borderActive : 'rgba(222,154,73,0.3)'}`,
                color: isActive ? s.textActive : '#5a4020',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                boxShadow: isActive
                  ? `0 5px 20px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.1)`
                  : 'none',
                transform: isActive ? 'translateY(-3px) scale(1.06)' : 'translateY(0) scale(1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                minHeight: 40,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(-2px) scale(1.03)';
                  el.style.boxShadow = `0 4px 14px ${s.glow}`;
                  el.style.borderColor = s.borderActive;
                  el.style.background = `rgba(${s.glow.replace('rgba(', '').split(',').slice(0, 3).join(',')}, 0.2)`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = 'rgba(222,154,73,0.5)';
                  el.style.background = '#ffffff';
                }
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              )}
              {/* Colored dot indicator */}
              <span style={{
                width: isActive ? 7 : 5,
                height: isActive ? 7 : 5,
                borderRadius: '50%',
                background: isActive ? s.textActive : s.accent,
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 0 2px ${s.borderActive}` : 'none',
                display: 'block',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{s.label}</span>
              {isActive && (
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '0.55rem',
                  opacity: 0.75,
                  marginLeft: 1,
                }}>✕</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
const PageWrapper = ({ children }: PageWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      flexGrow: 1,
      background: 'linear-gradient(180deg, #f5f3ec 0%, #ebe8dd 60%, #d8e0d8 100%)',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </motion.div>
);

const PageHero = ({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) => (
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
        color: '#de9a49',
        marginBottom: '1rem',
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
        background: 'linear-gradient(90deg,transparent,#de9a49,transparent)',
        margin: '2rem auto 0',
      }}
    />
  </div>
);

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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
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
      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(180deg, #f5f3ec 0%, #ebe8dd 100%)' }}>
        <PageHero
          title="All Classes"
          subtitle="Choose from 200+ workshops, talks, and experiences"
          accent="LEAP 2026 · Class Catalog"
        />
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
          background: 'transparent',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

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
                  border: '1px solid rgba(222,154,73,0.28)',
                  boxShadow: '0 14px 34px rgba(51,75,70,0.08), inset 0 1px 0 rgba(255,255,255,0.84)',
                  backdropFilter: 'blur(8px)',
                  marginBottom: '2rem',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search row */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      width: '100%',
                    }}
                  >
                    <style>{`
                        @media (min-width: 640px) {
                          .classes-search-row {
                            flex-direction: row !important;
                          }
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

                          .classes-date-row::-webkit-scrollbar {
                            display: none;
                          }

                          .classes-date-pill {
                            flex: 0 0 auto;
                            white-space: nowrap;
                            padding: 0.48rem 0.9rem !important;
                            font-size: 0.74rem !important;
                          }

                          .classes-sort-select {
                            width: 100%;
                          }
                        }
                      `}</style>
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
                          style={{ width: '100%', paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', boxSizing: 'border-box' }}
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
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                    <div
                      className="classes-date-row"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <button
                        className="classes-date-pill"
                        onClick={() => onDaySelect(null)}
                        style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          background: selectedDay === null ? '#de9a49' : 'rgba(249,236,182,0.5)',
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
                            padding: '0.4rem 1rem',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            background: selectedDay === day ? '#de9a49' : 'rgba(249,236,182,0.5)',
                            color: selectedDay === day ? '#1a1008' : '#7c6b4b',
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* View toggle - only show on mobile */}
                    {isMobile && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        <button
                          onClick={() => setViewMode('grid')}
                          title="Grid view"
                          style={{
                            width: 36,
                            height: 36,
                            padding: '0.5rem',
                            borderRadius: '0.6rem',
                            border: viewMode === 'grid' ? '1.5px solid #de9a49' : '1px solid rgba(210,175,110,0.3)',
                            background: viewMode === 'grid' ? 'rgba(222,154,73,0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: viewMode === 'grid' ? '#de9a49' : '#9c7a4a',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="1" width="6" height="6" />
                            <rect x="9" y="1" width="6" height="6" />
                            <rect x="1" y="9" width="6" height="6" />
                            <rect x="9" y="9" width="6" height="6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          title="List view"
                          style={{
                            width: 36,
                            height: 36,
                            padding: '0.5rem',
                            borderRadius: '0.6rem',
                            border: viewMode === 'list' ? '1.5px solid #de9a49' : '1px solid rgba(210,175,110,0.3)',
                            background: viewMode === 'list' ? 'rgba(222,154,73,0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: viewMode === 'list' ? '#de9a49' : '#9c7a4a',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="2" width="14" height="2" />
                            <rect x="1" y="7" width="14" height="2" />
                            <rect x="1" y="12" width="14" height="2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── SUBTHEME FILTER PILLS ── */}
              <SubthemeFilterPills
                selectedSubtheme={selectedSubtheme}
                onSubthemeSelect={(val) => {
                  const el = document.getElementById('classes-sticky-filters');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    const distance = Math.abs(window.scrollY - y);
                    const duration = distance > 100 ? 500 : 50;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    setTimeout(() => {
                      setSelectedSubtheme(val);
                    }, duration);
                  } else {
                    setSelectedSubtheme(val);
                  }
                }}
                isMobile={isMobile}
              />

              <div style={{ height: '0.5rem' }} />
              {/* ── RESULTS COUNT ── */}
              <div style={{ marginBottom: '2.5rem', marginTop: '1rem', textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.85rem',
                    color: '#7c6b4b',
                    fontWeight: 500,
                  }}
                >
                  Showing {visibleClasses.length} of {dateFilteredClasses.length} classes
                </p>
              </div>

              {/* ── CLASSES GRID ── */}

              <style>{`
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

                      /* 2-column on mobile when grid view */
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
                        width: 70px;
                        height: 70px;
                        border-radius: 0.7rem;
                        object-fit: cover;
                        flex-shrink: 0;
                      }

                      .class-list-item-content {
                        flex: 1;
                        min-width: 0;
                        display: flex;
                        flex-direction: column;
                        gap: 0.3rem;
                      }

                      .class-list-item-title {
                        font-weight: 700;
                        color: #3a2a10;
                        font-size: 0.9rem;
                        line-height: 1.2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                      }

                      .class-list-item-org {
                        font-size: 0.7rem;
                        color: #de9a49;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                      }

                      .class-list-item-meta {
                        font-size: 0.65rem;
                        color: #9c7a4a;
                        display: flex;
                        gap: 0.4rem;
                        flex-wrap: wrap;
                      }
                    `}</style>

              {viewMode === 'grid' ? (
                <motion.div
                  key={`${selectedSubtheme ?? 'all'}-${selectedDay ?? 'all'}`}
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
                          gridColumn: '1 / -1',
                          textAlign: 'center',
                          padding: '4rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.35 }}>
                          <g transform="translate(24,24)">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
                              const r = (ang * Math.PI) / 180;
                              return <line key={i} x1={Math.cos(r) * 8} y1={Math.sin(r) * 8} x2={Math.cos(r) * 18} y2={Math.sin(r) * 18} stroke="#de9a49" strokeWidth="2" strokeLinecap="round" />;
                            })}
                            <circle r="7" fill="none" stroke="#de9a49" strokeWidth="1.5" />
                            <circle r="3" fill="rgba(222,154,73,0.4)" />
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
                </div>
              )}

              {/* ── PAGINATION ── */}
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} style={{ height: 1 }} />
              {hasMore && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: '3px solid rgba(222,154,73,0.25)',
                      borderTopColor: '#de9a49',
                      borderRadius: '50%',
                      animation: 'leap-spin 0.7s linear infinite',
                      margin: '0 auto',
                    }}
                  />
                  <style>{`@keyframes leap-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </>
          )}
        </>
            )}
      </div>
    </main>

        {/* ── CLASS DETAIL MODAL ── */ }
  {
    user && viewingClass && (
      <motion.div
        className="classes-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClassSelect(null)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          height: '100dvh',
          overflow: 'hidden',
          background: 'rgba(8, 10, 8, 0.78)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: 'clamp(0.5rem, 2vw, 1.5rem)',
          display: 'grid',
          placeItems: 'center',
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
          {/* Close button */}
          <button
            onClick={() => onClassSelect(null)}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 10,
              background: 'rgba(255,252,241,0.96)',
              border: '1px solid rgba(224,183,136,0.3)',
              borderRadius: '999px',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334b46',
              boxShadow: '0 2px 8px rgba(51,75,70,0.12)',
              transition: 'background 0.2s',
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Modal inner: image + detail — stacks on mobile */}
          <style>{`
                .classes-modal-grid {
                  display: grid;
                  grid-template-columns: min(340px, 38%) 1fr;
                  overflow: auto;
                  max-height: calc(100dvh - 2rem);
                  width: 100%;
                }

                @media (max-width: 640px) {
                  .classes-modal-overlay {
                    padding: 0 !important;
                  }

                  .classes-modal-panel {
                    width: 100vw !important;
                    max-height: 100dvh !important;
                    height: 100dvh !important;
                    border-radius: 0 !important;
                    border: none !important;
                  }

                  .classes-modal-grid {
                    display: flex;
                    flex-direction: column;
                    overflow: auto;
                    max-height: 100dvh;
                  }

                  .modal-image { 
                    min-height: 200px !important;
                    max-height: 240px !important;
                    order: -1 !important;
                  }

                  .classes-modal-detail {
                    padding: 1rem 0.95rem 1.2rem !important;
                    overflow-y: auto;
                  }

                  .classes-modal-meta {
                    grid-template-columns: 1fr !important;
                  }

                  .classes-modal-cta {
                    width: 100% !important;
                  }
                }
              `}</style>
          <div className="classes-modal-grid">
            {/* Image panel */}
            <div
              className="modal-image"
              style={{
                position: 'relative',
                minHeight: 260,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={viewingClass.image}
                alt={viewingClass.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                referrerPolicy="no-referrer"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {viewingClass.orgLogo && (
                  <img
                    src={viewingClass.orgLogo}
                    alt={viewingClass.org}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      objectFit: 'cover',
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
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
                    fontWeight: 800,
                    color: '#334b46',
                    lineHeight: 1.1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {viewingClass.title}
                </h1>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#b05a32',
                  }}
                >
                  Organized by {viewingClass.org}
                </p>
              </div>

              {/* Metadata grid */}
              <div
                className="classes-modal-meta"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Date & Time</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.date} · {viewingClass.time}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Location</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.venue} ({viewingClass.modality})</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Slots</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.slots} participants</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  borderTop: '1px solid rgba(229,207,171,0.6)',
                  paddingTop: '1rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#334b46',
                    marginBottom: '0.6rem',
                  }}
                >
                  About this class
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.95rem',
                    lineHeight: 1.8,
                    color: 'rgba(51,75,70,0.8)',
                  }}
                >
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 2rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Register Now <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }
      </PageWrapper >
    );
}