import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, MapPin, Users, ExternalLink, X, ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import styles from '../App.module.css';

interface LeapClass {
  id: string; title: string; org: string; modality: string; date: string;
  time: string; venue: string; slots: number; subtheme: string; image: string;
  orgLogo: string | null; googleFormUrl: string; description: string;
}
interface HomeProps {
  user: FirebaseUser | null; classes: LeapClass[];
  filteredAndSortedClasses: LeapClass[]; uniqueDays: string[];
  selectedDay: string | null; onDaySelect: (day: string | null) => void;
  viewingClass: LeapClass | null; onClassSelect: (leapClass: LeapClass | null) => void;
  onSignIn: () => void; onHeroScroll: () => void;
  HeroSection: ReactNode; HeroExtras: ReactNode | null;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

const CLASSES_PER_DAY = 6;

/* ─── Firefly seeds (deterministic, no runtime random) ─── */
const HOME_FLIES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i * 16.7 + (i % 4) * 19) % 96 + 2,
  y: (i * 12.1 + (i % 6) * 11) % 94 + 2,
  size: 2 + (i % 3),
  delay: (i * 0.57) % 6.5,
  dur: 3.2 + (i % 5) * 0.58,
}));

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

/* ─── Palay (rice grain) ornament ─── */
const PalayOrnament = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 100 24"
    width="90"
    height="24"
    aria-hidden="true"
    style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.5 }}
  >
    <path d="M4 20 Q22 15 40 17 Q58 19 74 13 Q88 8 96 10"
      stroke="#c8923e" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    {[22, 40, 58, 76].map((x, i) => {
      const y = i % 2 === 0 ? 14 : 12;
      return (
        <g key={i}>
          <path d={`M${x} ${y+3} Q${x-2} ${y-3} ${x} ${y-7}`}
            stroke="#7aaa3a" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <ellipse cx={x - 3} cy={y - 8} rx="3" ry="4.5"
            fill="#c8923e" opacity="0.7"
            transform={`rotate(-20, ${x-3}, ${y-8})`}/>
          <ellipse cx={x + 2.5} cy={y - 6} rx="2.5" ry="4"
            fill="#a87028" opacity="0.6"
            transform={`rotate(20, ${x+2.5}, ${y-6})`}/>
        </g>
      );
    })}
  </svg>
);

/* ─── Filipino sun rays ornament ─── */
const SunOrnament = ({ size = 32, opacity = 0.18 }: { size?: number; opacity?: number }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} style={{ opacity }} aria-hidden="true">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const inner = 14, outer = i % 3 === 0 ? 26 : 22;
      return (
        <line key={i}
          x1={30 + Math.cos(rad) * inner} y1={30 + Math.sin(rad) * inner}
          x2={30 + Math.cos(rad) * outer} y2={30 + Math.sin(rad) * outer}
          stroke="#c8923e" strokeWidth={i % 3 === 0 ? 1.5 : 1} strokeLinecap="round"/>
      );
    })}
    <circle cx="30" cy="30" r="11" fill="none" stroke="#c8923e" strokeWidth="1.3"/>
    <circle cx="30" cy="30" r="5" fill="rgba(200,146,62,0.28)"/>
  </svg>
);

/* ─── Small diamond divider ─── */
const DiamondDivider = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    margin: '0.5rem 0 1rem', padding: '0 0.2rem',
  }}>
    <span style={{
      flex: 1, height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(200,146,62,0.4))',
    }}/>
    <svg viewBox="0 0 12 12" width="10" height="10" style={{ opacity: 0.55 }} aria-hidden="true">
      <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="#c8923e"/>
    </svg>
    <span style={{
      flex: 1, height: '1px',
      background: 'linear-gradient(90deg, rgba(200,146,62,0.4), transparent)',
    }}/>
  </div>
);

/* ─── Day number badge ─── */
const DayBadge = ({ num, active }: { num: number; active: boolean }) => (
  <div style={{
    width: 38, height: 38, flexShrink: 0,
    borderRadius: '50%',
    background: active
      ? 'linear-gradient(135deg, rgba(200,146,62,0.22), rgba(200,146,62,0.12))'
      : 'rgba(200,146,62,0.06)',
    border: active
      ? '1.5px solid rgba(200,146,62,0.55)'
      : '1px solid rgba(200,146,62,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 800,
    color: active ? '#8a4e1a' : '#a08060',
    letterSpacing: '0.02em',
    transition: 'all 0.2s',
  }}>
    {String(num).padStart(2, '0')}
  </div>
);

/* ─── Section: catalog header ─── */
const CatalogHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      alignItems: 'center', gap: '0.4rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <PalayOrnament />
        <h2 style={{
          fontFamily: "'Tropikal', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          fontWeight: 700,
          color: '#3a2210',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          margin: 0,
        }}>
          Class Catalog
        </h2>
        <PalayOrnament flip />
      </div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#c8923e',
        opacity: 0.85,
        margin: 0,
      }}>
        LEAP 2026 · Isang Nayon, Isang Layunin
      </p>
    </div>
  </div>
);

/* ─── Shared card/panel surface style ─── */
const surface: React.CSSProperties = {
  background: 'rgba(255, 252, 243, 0.97)',
  border: '1px solid rgba(200,160,80,0.22)',
  borderRadius: 18,
  boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 12px rgba(120,80,20,0.07), 0 1px 3px rgba(120,80,20,0.04)',
  position: 'relative' as const,
};

/* ─── Top accent line (amber gradient) ─── */
const AccentLine = ({ bright = false }: { bright?: boolean }) => (
  <div style={{
    position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
    borderRadius: '0 0 2px 2px',
    background: bright
      ? 'linear-gradient(90deg, transparent, rgba(200,146,62,0.75), rgba(240,200,100,0.95), rgba(200,146,62,0.75), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(200,146,62,0.45), rgba(240,200,100,0.7), rgba(200,146,62,0.45), transparent)',
  }} />
);

export default function Home({
  user,
  filteredAndSortedClasses, uniqueDays, onDaySelect,
  viewingClass, onClassSelect, onSignIn, HeroSection, HeroExtras, renderClassCard,
}: HomeProps) {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const isDesktop = w >= 1024;
  const stickyTop = isDesktop ? 168 : isMobile ? 110 : 134;

  const displayedDays = useMemo(() => uniqueDays, [uniqueDays]);
  const classesByDay = useMemo(() => {
    const grouped: Record<string, LeapClass[]> = {};
    filteredAndSortedClasses.forEach(cls => {
      if (!grouped[cls.date]) grouped[cls.date] = [];
      grouped[cls.date].push(cls);
    });
    return grouped;
  }, [filteredAndSortedClasses]);

  const [activeDay, setActiveDay] = useState<string | null>(displayedDays[0] ?? null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (displayedDays.length === 0) { setActiveDay(null); onDaySelect(null); return; }
    if (!activeDay || !displayedDays.includes(activeDay)) {
      setActiveDay(displayedDays[0]);
      onDaySelect(displayedDays[0]);
    }
  }, [activeDay, displayedDays, onDaySelect]);

  useEffect(() => {
    if (!user || displayedDays.length === 0) return;
    const observers: IntersectionObserver[] = [];
    displayedDays.forEach(day => {
      const el = daySectionRefs.current[day];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setActiveDay(day); onDaySelect(day); } },
        { rootMargin: `-100px 0px -55% 0px`, threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [user, displayedDays, onDaySelect]);

  const scrollToDay = useCallback((day: string) => {
    const el = daySectionRefs.current[day];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
    setActiveDay(day);
    onDaySelect(day);
  }, [onDaySelect]);

  const toggleDayExpanded = useCallback((day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  }, []);

  useEffect(() => {
    document.body.style.overflow = viewingClass ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [viewingClass]);

  return (
    <main
      className="flex-grow hero-bg"
      style={{ position: 'relative', overflow: 'clip', isolation: 'isolate' }}
    >
      {/* ── Fireflies ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {HOME_FLIES.map(f => (
          <span key={f.id} className="firefly" style={{
            left: `${f.x}%`, top: `${f.y}%`,
            width: f.size, height: f.size,
            animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s`,
            boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.55)`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Hero ── */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 15%, rgba(200,146,62,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {HeroSection}
        </section>
        {HeroExtras}

        {/* ══════════════════════════════════
            CLASS CATALOG SECTION
        ══════════════════════════════════ */}
        <section
          id="classes-section"
          style={{
            padding: isMobile ? '1.5rem 0 5rem' : '3rem 0 7rem',
            position: 'relative',
            background: `
              radial-gradient(ellipse 55% 35% at 12% 20%, rgba(80,160,120,0.055) 0%, transparent 55%),
              radial-gradient(ellipse 50% 30% at 90% 80%, rgba(200,146,62,0.06) 0%, transparent 50%),
              linear-gradient(180deg, #fffdf6 0%, #fdf7e8 30%, #f8efcf 65%, #f0e0b0 100%)
            `,
          }}
        >
          {/* Top accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,146,62,0.3) 15%, rgba(240,200,100,0.7) 50%, rgba(200,146,62,0.3) 85%, transparent 100%)',
          }} />

          <div style={{
            maxWidth: 1260, margin: '0 auto',
            padding: `0 clamp(0.75rem, 3vw, 1.75rem)`,
            boxSizing: 'border-box', width: '100%',
          }}>
            <CatalogHeader />

            {/* ── Layout: sidebar + content ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '240px 1fr' : '1fr',
              gap: isMobile ? '1rem' : '1.75rem',
              alignItems: 'start',
              position: 'relative',
            }}>

              {/* ════════════════════
                  SIDEBAR (DESKTOP)
              ════════════════════ */}
              {isDesktop && (
                <aside style={{
                  ...surface,
                  padding: '1.4rem 1.1rem 1.3rem',
                  position: 'sticky',
                  top: `${stickyTop}px`,
                  maxHeight: `calc(100vh - ${stickyTop + 24}px)`,
                  overflowY: 'auto',
                  alignSelf: 'start',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(200,146,62,0.25) transparent',
                }}>
                  <AccentLine />

                  {/* Sidebar header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                    <p style={{
                      fontFamily: "'Tropikal', 'Playfair Display', serif",
                      fontSize: '1.1rem', fontWeight: 700, color: '#2e1e08', margin: 0,
                    }}>LEAP Days</p>
                    <SunOrnament size={28} opacity={0.2} />
                  </div>
                  <p style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.2em', color: '#c8923e', margin: 0,
                  }}>2026</p>

                  <DiamondDivider />

                  <p style={{
                    fontSize: '0.72rem', color: '#7a6040',
                    fontWeight: 500, lineHeight: 1.5, marginBottom: '1rem',
                  }}>
                    Jump to a day's classes
                  </p>

                  {/* Day list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {displayedDays.map((day, idx) => {
                      const isActive = activeDay === day;
                      const count = classesByDay[day]?.length ?? 0;
                      return (
                        <button key={day} onClick={() => scrollToDay(day)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 0.7rem', borderRadius: 13,
                          border: isActive
                            ? '1px solid rgba(200,146,62,0.45)'
                            : '1px solid rgba(200,160,80,0.12)',
                          background: isActive
                            ? 'linear-gradient(145deg, rgba(254,246,220,0.95), rgba(252,240,200,0.92))'
                            : 'rgba(255,253,245,0.45)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          textAlign: 'left', width: '100%', position: 'relative',
                          boxShadow: isActive
                            ? '0 4px 16px rgba(160,100,20,0.12), 0 1px 0 rgba(255,255,255,0.9) inset'
                            : 'none',
                        }}>
                          {isActive && (
                            <div style={{
                              position: 'absolute', left: -1, top: '18%', bottom: '18%',
                              width: 3, borderRadius: 99,
                              background: 'linear-gradient(180deg, #f0c060, #c8923e, #9a6020)',
                            }} />
                          )}
                          <DayBadge num={idx + 1} active={isActive} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: '0.58rem', fontWeight: 800,
                              textTransform: 'uppercase', letterSpacing: '0.14em',
                              color: isActive ? '#9a5020' : '#8a7050',
                              display: 'block',
                            }}>
                              Day {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span style={{
                              fontFamily: "'Tropikal', 'Playfair Display', serif",
                              fontSize: '0.88rem', fontWeight: 700,
                              color: isActive ? '#2e1e08' : '#5a4030',
                              display: 'block', marginTop: '0.08rem',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {day}
                            </span>
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              color: isActive ? '#c8923e' : '#9a7a50',
                              display: 'block', marginTop: '0.06rem',
                            }}>
                              {count} {count === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sidebar footer */}
                  <div style={{
                    marginTop: '1rem', paddingTop: '0.8rem',
                    borderTop: '1px solid rgba(200,160,80,0.18)',
                    display: 'flex', justifyContent: 'center',
                  }}>
                    <SunOrnament size={26} opacity={0.22} />
                  </div>
                </aside>
              )}

              {/* ════════════════════
                  MAIN CONTENT AREA
              ════════════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.75rem', minWidth: 0 }}>

                {/* ── Mobile day selector ── */}
                {isMobile && displayedDays.length > 0 && (
                  <div style={{ ...surface, padding: '1rem 1.1rem' }}>
                    <AccentLine />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block', fontSize: '0.58rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.18em',
                          color: '#c8923e', marginBottom: '0.45rem',
                        }}>
                          Select Day
                        </label>
                        <select
                          value={activeDay || ''}
                          onChange={e => {
                            const day = e.target.value;
                            if (day && displayedDays.includes(day)) {
                              setActiveDay(day);
                              setViewMode('grid');
                              scrollToDay(day);
                            }
                          }}
                          style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
                            border: '1.5px solid rgba(200,146,62,0.35)',
                            background: 'rgba(255,252,243,0.95)',
                            fontFamily: "'Tropikal', 'Playfair Display', serif",
                            fontSize: '0.92rem', fontWeight: 700, color: '#2e1e08',
                            cursor: 'pointer', boxSizing: 'border-box',
                            boxShadow: '0 2px 8px rgba(120,80,20,0.07)',
                            appearance: 'none',
                          }}
                        >
                          {displayedDays.map((day, idx) => (
                            <option key={day} value={day}>
                              Day {String(idx + 1).padStart(2, '0')} — {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* View mode toggle */}
                      <div style={{
                        display: 'flex', borderRadius: 10, overflow: 'hidden',
                        border: '1px solid rgba(200,146,62,0.25)',
                      }}>
                        {(['grid', 'list'] as const).map(mode => (
                          <button key={mode} onClick={() => setViewMode(mode)} title={`${mode} view`} style={{
                            padding: '0.62rem 0.7rem',
                            background: viewMode === mode ? 'rgba(200,146,62,0.15)' : 'transparent',
                            border: 'none',
                            borderRight: mode === 'grid' ? '1px solid rgba(200,146,62,0.2)' : 'none',
                            cursor: 'pointer', transition: 'all 0.18s',
                            color: viewMode === mode ? '#c8923e' : '#a08060',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Gate: sign-in prompt ── */}
                {!user ? (
                  <div style={{ ...surface, padding: isMobile ? '2.5rem 1.25rem' : '4rem 2.5rem', textAlign: 'center' }}>
                    <AccentLine bright />
                    <div style={{
                      width: 64, height: 64, margin: '0 auto 1.5rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(200,146,62,0.15), rgba(200,146,62,0.08))',
                      border: '1px solid rgba(200,146,62,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SunOrnament size={34} opacity={0.55} />
                    </div>
                    <h3 style={{
                      fontFamily: "'Tropikal', 'Playfair Display', serif",
                      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                      fontWeight: 700, color: '#2e1e08',
                      marginBottom: '0.6rem',
                    }}>
                      Sign in to see classes
                    </h3>
                    <p style={{ color: '#6a5030', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
                      Use your DLSU account to view and register for LEAP 2026 classes.
                    </p>
                    <button onClick={onSignIn} className="btn-leap-primary" style={{
                      padding: '0.9rem 2.2rem', fontSize: '0.9rem', borderRadius: 14,
                    }}>
                      Sign In with DLSU
                    </button>
                  </div>

                ) : displayedDays.length === 0 ? (
                  <div style={{ ...surface, padding: '3rem 2rem', textAlign: 'center' }}>
                    <AccentLine />
                    <p style={{ color: '#7a6040', fontSize: '0.95rem' }}>No classes available.</p>
                  </div>

                ) : isMobile ? (
                  /* ── MOBILE: single-day grid/list ── */
                  activeDay && classesByDay[activeDay] ? (
                    <div>
                      {/* Day label */}
                      <div style={{ marginBottom: '0.85rem', paddingLeft: '0.1rem' }}>
                        <p style={{
                          fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                          letterSpacing: '0.22em', color: '#c8923e', margin: '0 0 0.2rem',
                        }}>
                          Day {String(displayedDays.indexOf(activeDay) + 1).padStart(2, '0')}
                        </p>
                        <h2 style={{
                          fontFamily: "'Tropikal', 'Playfair Display', serif",
                          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                          fontWeight: 700, color: '#2e1e08', margin: '0 0 0.25rem',
                        }}>
                          {activeDay}
                        </h2>
                        <p style={{ color: '#7a6040', fontSize: '0.82rem', margin: 0 }}>
                          {classesByDay[activeDay].length} {classesByDay[activeDay].length === 1 ? 'class' : 'classes'}
                        </p>
                      </div>

                      {viewMode === 'grid' ? (
                        <div className={styles.classGrid} style={{ gap: '0.9rem' }}>
                          {classesByDay[activeDay].map((cls, idx) => renderClassCard(cls, idx))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {classesByDay[activeDay].map(cls => (
                            <MobileListCard key={cls.id} cls={cls} surface={surface} onSelect={onClassSelect} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null

                ) : (
                  /* ── DESKTOP: all-day sections ── */
                  displayedDays.map((day, idx) => {
                    const dayClasses = classesByDay[day] ?? [];
                    const isExpanded = !!expandedDays[day];
                    const hasMore = dayClasses.length > CLASSES_PER_DAY;
                    const visible = isExpanded ? dayClasses : dayClasses.slice(0, CLASSES_PER_DAY);
                    const hidden = dayClasses.length - CLASSES_PER_DAY;
                    const isActive = activeDay === day;

                    return (
                      <div
                        key={day}
                        ref={el => { daySectionRefs.current[day] = el; }}
                        style={{
                          ...surface,
                          padding: 0,
                          scrollMarginTop: '6rem',
                          overflow: 'hidden',
                          border: isActive
                            ? '1px solid rgba(200,146,62,0.38)'
                            : '1px solid rgba(200,160,80,0.18)',
                          boxShadow: isActive
                            ? '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px rgba(140,90,20,0.1), 0 2px 8px rgba(140,90,20,0.06)'
                            : surface.boxShadow,
                          transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                      >
                        <AccentLine bright={isActive} />

                        {/* ── Day header ── */}
                        <div style={{
                          padding: '1.4rem 1.6rem 1rem',
                          borderBottom: '1px solid rgba(200,160,80,0.15)',
                          display: 'flex', alignItems: 'flex-end',
                          justifyContent: 'space-between', gap: '0.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <DayBadge num={idx + 1} active={isActive} />
                            <div>
                              <p style={{
                                fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.24em', color: '#c8923e', margin: '0 0 0.18rem',
                              }}>
                                Day {String(idx + 1).padStart(2, '0')}
                              </p>
                              <h2 style={{
                                fontFamily: "'Tropikal', 'Playfair Display', serif",
                                fontSize: 'clamp(1.3rem, 2vw, 1.8rem)',
                                fontWeight: 700, color: '#2e1e08', margin: 0, lineHeight: 1.05,
                              }}>
                                {day}
                              </h2>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                            <PalayOrnament flip />
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 800,
                              textTransform: 'uppercase', letterSpacing: '0.1em',
                              color: isActive ? '#c8923e' : '#9a7a50',
                              textAlign: 'right',
                            }}>
                              {dayClasses.length}<br/>{dayClasses.length === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </div>

                        {/* ── Classes grid ── */}
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                          {dayClasses.length === 0 ? (
                            <p style={{ color: '#9a7a50', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>
                              No classes on this day.
                            </p>
                          ) : (
                            <>
                              <div className={styles.classGrid}>
                                {visible.map((cls, cIdx) => renderClassCard(cls, cIdx))}
                              </div>
                              {hasMore && (
                                <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                                  <button
                                    onClick={() => toggleDayExpanded(day)}
                                    style={{
                                      padding: '0.65rem 1.35rem', borderRadius: 10,
                                      border: '1px solid rgba(200,146,62,0.28)',
                                      background: 'rgba(240,200,100,0.1)',
                                      color: '#c8923e', fontWeight: 700, cursor: 'pointer',
                                      transition: 'all 0.18s',
                                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
                                      display: 'inline-flex', alignItems: 'center',
                                      gap: '0.45rem',
                                    }}
                                  >
                                    {isExpanded
                                      ? <><ChevronUp size={14} /> Show Less</>
                                      : <><ChevronDown size={14} /> See {hidden} More {hidden === 1 ? 'Class' : 'Classes'}</>
                                    }
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            CLASS DETAIL MODAL
        ══════════════════════════════════ */}
        {user && viewingClass && createPortal(
          <ClassModal
            cls={viewingClass}
            onClose={() => onClassSelect(null)}
            isMobile={isMobile}
            w={w}
          />,
          document.body
        )}
      </div>
    </main>
  );
}

/* ─── Mobile list card ─── */
function MobileListCard({
  cls, surface, onSelect,
}: {
  cls: LeapClass;
  surface: React.CSSProperties;
  onSelect: (c: LeapClass) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onSelect(cls)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...surface,
        padding: '0.85rem',
        display: 'flex', gap: '0.7rem',
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? '0 8px 24px rgba(120,80,20,0.12)'
          : surface.boxShadow,
      }}
    >
      <div style={{
        width: 68, height: 68, borderRadius: 10,
        overflow: 'hidden', flexShrink: 0,
        background: 'rgba(200,146,62,0.08)',
      }}>
        <img src={cls.image} alt={cls.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          referrerPolicy="no-referrer" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{
          fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#c8923e', margin: 0,
        }}>
          {cls.org}
        </p>
        <h3 style={{
          fontFamily: "'Tropikal', 'Playfair Display', serif",
          fontSize: '0.88rem', fontWeight: 700, color: '#2e1e08',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.25,
        }}>
          {cls.title}
        </h3>
        <p style={{ fontSize: '0.68rem', color: '#6a5030', margin: 0 }}>
          {cls.date} · {cls.slots} slots
        </p>
      </div>
    </div>
  );
}

/* ─── Class detail modal ─── */
function ClassModal({
  cls, onClose, isMobile, w,
}: {
  cls: LeapClass;
  onClose: () => void;
  isMobile: boolean;
  w: number;
}) {
  const twoCol = w >= 640;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(10,8,5,0.82)',
        backdropFilter: 'blur(8px)',
        padding: isMobile ? 0 : 'clamp(0.75rem, 2vw, 1.5rem)',
        overflow: 'hidden',
        display: 'grid', placeItems: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? '100vw' : 'min(1020px, 96vw)',
          maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 2rem)',
          height: isMobile ? '100dvh' : 'auto',
          background: 'linear-gradient(175deg, #fffdf6 0%, #f8efcf 100%)',
          borderRadius: isMobile ? 0 : 20,
          overflow: 'auto',
          border: isMobile ? 'none' : '1px solid rgba(200,160,80,0.3)',
          boxShadow: isMobile ? 'none' : '0 28px 80px rgba(30,18,5,0.28), 0 0 0 1px rgba(255,255,255,0.08) inset',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,252,240,0.95)',
            border: '1px solid rgba(200,160,80,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#3a2210',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.18s',
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: twoCol ? 'min(320px, 36%) 1fr' : '1fr',
        }}>
          {/* ── Image column ── */}
          <div style={{
            position: 'relative',
            minHeight: twoCol ? 320 : 220,
            maxHeight: twoCol ? 'none' : 260,
            overflow: 'hidden',
          }}>
            <img
              src={cls.image} alt={cls.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              referrerPolicy="no-referrer"
            />
            {/* Overlay gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: twoCol
                ? 'linear-gradient(to right, transparent 60%, rgba(254,251,238,0.6) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)',
            }} />
            {/* Badges */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {cls.orgLogo && (
                <img src={cls.orgLogo} alt={cls.org}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    objectFit: 'cover', border: '2px solid rgba(200,146,62,0.55)',
                  }}
                  referrerPolicy="no-referrer" />
              )}
              {cls.subtheme && (
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(200,146,62,0.9)',
                  color: '#fff', fontSize: '0.6rem',
                  fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase', backdropFilter: 'blur(4px)',
                }}>
                  {cls.subtheme}
                </span>
              )}
            </div>
          </div>

          {/* ── Info column ── */}
          <div style={{
            padding: isMobile ? '1.1rem 1.1rem 1.5rem' : 'clamp(1.25rem, 2.5vw, 2rem)',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            {/* Title block */}
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 800, color: '#2e1e08', lineHeight: 1.1, marginBottom: '0.4rem',
              }}>
                {cls.title}
              </h1>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8923e',
              }}>
                Organized by {cls.org}
              </p>
            </div>

            {/* Meta chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { icon: <Calendar size={15} />, label: 'Date & Time', val: `${cls.date} · ${cls.time}` },
                { icon: <MapPin size={15} />, label: 'Location', val: `${cls.venue} (${cls.modality})` },
                { icon: <Users size={15} />, label: 'Slots', val: `${cls.slots} participants` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(200,146,62,0.1)',
                    border: '1px solid rgba(200,146,62,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c8923e',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.12em', color: '#9a7a50', margin: '0 0 2px',
                    }}>
                      {item.label}
                    </p>
                    <p style={{ fontWeight: 600, color: '#2e1e08', fontSize: '0.86rem', margin: 0 }}>
                      {item.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid rgba(200,160,80,0.2)', paddingTop: '1rem' }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem', fontWeight: 700, color: '#2e1e08', marginBottom: '0.55rem',
              }}>
                About this class
              </h3>
              <p style={{ color: '#5a4030', lineHeight: 1.8, fontSize: '0.92rem' }}>
                {cls.description || 'No description provided.'}
              </p>
            </div>

            {/* CTA */}
            <a
              href={cls.googleFormUrl || '#'}
              target="_blank" rel="noopener noreferrer"
              className="btn-leap-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '0.88rem 1.75rem', borderRadius: 13,
                fontSize: '0.88rem', textDecoration: 'none',
                width: isMobile ? '100%' : 'fit-content',
              }}
            >
              Register via Google Forms <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}