import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X, ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { ThemeBackground } from '../components/ThemeBackground';
import styles from '../App.module.css';
import { SubthemeFilterPills } from '../components/shared/SubthemeFilterPills';

/* ════════════════════════════════════════════
   BRAND PALETTE
   Light Blue    #C9E0E4
   Fun Green     #006937
   Soft Yellow   #fae185
   Acorn         #8b4a06
   Blizzard Blue #99d9eb
   Mountain Meadow #16a460
   Light Gold    #efe6ad
   Clay Brown    #bf6e19
   ════════════════════════════════════════════ */

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

/* ─── Palay ornament ─── */
const PalayOrnament = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 100 24" width="90" height="24" aria-hidden="true"
    style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.5 }}>
    <path d="M4 20 Q22 15 40 17 Q58 19 74 13 Q88 8 96 10"
      stroke="#bf6e19" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {[22, 40, 58, 76].map((x, i) => {
      const y = i % 2 === 0 ? 14 : 12;
      return (
        <g key={i}>
          <path d={`M${x} ${y + 3} Q${x - 2} ${y - 3} ${x} ${y - 7}`}
            stroke="#16a460" strokeWidth="1" fill="none" strokeLinecap="round" />
          <ellipse cx={x - 3} cy={y - 8} rx="3" ry="4.5"
            fill="#bf6e19" opacity="0.7" transform={`rotate(-20, ${x - 3}, ${y - 8})`} />
          <ellipse cx={x + 2.5} cy={y - 6} rx="2.5" ry="4"
            fill="#8b4a06" opacity="0.6" transform={`rotate(20, ${x + 2.5}, ${y - 6})`} />
        </g>
      );
    })}
  </svg>
);

/* ─── Sun ornament ─── */
const SunOrnament = ({ size = 32, opacity = 0.18 }: { size?: number; opacity?: number }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} style={{ opacity }} aria-hidden="true">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const inner = 14, outer = i % 3 === 0 ? 26 : 22;
      return (
        <line key={i}
          x1={30 + Math.cos(rad) * inner} y1={30 + Math.sin(rad) * inner}
          x2={30 + Math.cos(rad) * outer} y2={30 + Math.sin(rad) * outer}
          stroke="#bf6e19" strokeWidth={i % 3 === 0 ? 1.5 : 1} strokeLinecap="round" />
      );
    })}
    <circle cx="30" cy="30" r="11" fill="none" stroke="#bf6e19" strokeWidth="1.3" />
    <circle cx="30" cy="30" r="5" fill="rgba(191,110,25,0.28)" />
  </svg>
);

/* ─── Diamond divider ─── */
const DiamondDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0 1rem', padding: '0 0.2rem' }}>
    <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(191,110,25,0.4))' }} />
    <svg viewBox="0 0 12 12" width="10" height="10" style={{ opacity: 0.55 }} aria-hidden="true">
      <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="#bf6e19" />
    </svg>
    <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(191,110,25,0.4), transparent)' }} />
  </div>
);

/* ─── Day badge ─── */
const DayBadge = ({ num, active }: { num: number; active: boolean }) => (
  <div style={{
    width: 38, height: 38, flexShrink: 0, borderRadius: '50%',
    background: active ? 'linear-gradient(135deg, rgba(191,110,25,0.22), rgba(191,110,25,0.12))' : 'rgba(191,110,25,0.06)',
    border: active ? '1.5px solid rgba(191,110,25,0.55)' : '1px solid rgba(191,110,25,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 800,
    color: active ? '#8b4a06' : '#a08060', letterSpacing: '0.02em', transition: 'all 0.2s',
  }}>
    {String(num).padStart(2, '0')}
  </div>
);

/* ─── Catalog header ─── */
const CatalogHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <PalayOrnament />
        <h2 style={{
          fontFamily: "'Tropikal', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700,
          color: '#3a2210', letterSpacing: '-0.01em', lineHeight: 1, margin: 0,
        }}>Class Catalog</h2>
        <PalayOrnament flip />
      </div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.3em', textTransform: 'uppercase', color: '#bf6e19', opacity: 0.85, margin: 0,
      }}>LEAP 2026 · Isang Nayon, Isang Layunin</p>
    </div>
  </div>
);

/* ─── Surface style ─── */
const surface: React.CSSProperties = {
  background: 'rgba(255, 252, 243, 0.97)',
  border: '1px solid rgba(191,110,25,0.22)',
  borderRadius: 18,
  boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 12px rgba(120,80,20,0.07), 0 1px 3px rgba(120,80,20,0.04)',
  position: 'relative' as const,
};

/* ─── Accent line ─── */
const AccentLine = ({ bright = false }: { bright?: boolean }) => (
  <div style={{
    position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
    borderRadius: '0 0 2px 2px',
    background: bright
      ? 'linear-gradient(90deg, transparent, rgba(191,110,25,0.75), rgba(250,225,133,0.95), rgba(191,110,25,0.75), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(191,110,25,0.45), rgba(250,225,133,0.7), rgba(191,110,25,0.45), transparent)',
  }} />
);

/* ════════════════════════════════════════════
   FILIPINO CULTURAL ICONS — MODAL META
   ════════════════════════════════════════════ */

/* Paraw (outrigger sailboat) — Date & Time */
const IconParaw = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <ellipse cx="11" cy="16" rx="7.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M7 16 Q8 11 11 8 Q14 11 15 16" fill="rgba(191,110,25,0.18)" stroke="currentColor" strokeWidth="1.2" />
    <line x1="11" y1="8" x2="11" y2="3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M11 3.5 L16.5 8 L11 9 Z" fill="currentColor" opacity="0.55" />
    <path d="M3.5 15.5 Q5 14.5 6.5 15.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    <line x1="5" y1="15" x2="7" y2="14" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

/* Bahay Kubo — Location */
const IconBahayKubo = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <line x1="8" y1="19" x2="8" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="14" y1="19" x2="14" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <rect x="6.5" y="12" width="9" height="5.5" rx="0.8" fill="rgba(191,110,25,0.15)" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 12.5 L11 5.5 L18 12.5" fill="rgba(191,110,25,0.22)" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M3 12.8 L4.5 11.5 M19 12.8 L17.5 11.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    <rect x="10" y="14.5" width="2" height="3" rx="0.4" fill="currentColor" opacity="0.45" />
  </svg>
);

/* Sampaguita — Slots */
const IconSampaguita = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="2.2" fill="currentColor" opacity="0.55" />
    {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map((deg, i) => {
      const r = (deg * Math.PI) / 180;
      const cx = 11 + Math.cos(r) * 4.8;
      const cy = 11 + Math.sin(r) * 4.8;
      return (
        <ellipse key={i} cx={cx} cy={cy} rx="1.7" ry="2.9"
          fill="rgba(191,110,25,0.22)" stroke="currentColor" strokeWidth="0.9"
          transform={`rotate(${deg + 90} ${cx} ${cy})`} />
      );
    })}
  </svg>
);

/* ════════════════════════════════════════════
   SUBTHEME ICON COMPONENTS (Line-Art Filipino Style)
   Consistent 26x26 viewBox, 1.3 stroke width, and 
   opacity accents based on the 'Karunungan' scroll.
   ════════════════════════════════════════════ */

/* ALL THEMES — Araw ng Watawat (Philippine Sun)
   Clean 8-ray sun motif representing all sectors */
const IconAllThemes = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <circle cx="13" cy="13" r="5.5" stroke={color} strokeWidth="1.3" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const r = (deg * Math.PI) / 180;
      const isLong = i % 2 === 0;
      return (
        <line key={i}
          x1={13 + Math.cos(r) * 7.5} y1={13 + Math.sin(r) * 7.5}
          x2={13 + Math.cos(r) * (isLong ? 11 : 9.5)} y2={13 + Math.sin(r) * (isLong ? 11 : 9.5)}
          stroke={color} strokeWidth="1.3" strokeLinecap="round"
        />
      );
    })}
    <circle cx="13" cy="13" r="2.5" fill={color} opacity="0.6" />
  </svg>
);

/* PALAYAN NG KARUNUNGAN — Scroll/Manuscript
   (knowledge, learning) */
const IconKarunungan = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path d="M5 7 Q5 4 8 4 L18 4 Q21 4 21 7 L21 20 Q21 23 18 23 L8 23 Q5 23 5 20 Z"
      stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M8 4 Q6 4 6 6 Q6 8 8 8" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M8 23 Q6 23 6 21 Q6 19 8 19" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <line x1="9" y1="10.5" x2="17" y2="10.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    <line x1="9" y1="13" x2="17" y2="13" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    <line x1="9" y1="15.5" x2="14" y2="15.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    <circle cx="15.5" cy="15.5" r="1.2" fill={color} opacity="0.5" />
  </svg>
);

/* PAMILIHAN NG KAKAYAHAN — Bayong (Woven Market Basket)
   (livelihood, skills market) */
const IconKakayahan = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    {/* Basket body */}
    <path d="M6 10 L20 10 L18 22 L8 22 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    {/* Handles */}
    <path d="M9 10 Q9 4.5 13 4.5 Q17 4.5 17 10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    {/* Weave accents */}
    <line x1="10" y1="10" x2="9.3" y2="22" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    <line x1="13" y1="10" x2="13" y2="22" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    <line x1="16" y1="10" x2="16.7" y2="22" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    <line x1="7.5" y1="14" x2="18.5" y2="14" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    <line x1="7" y1="18" x2="19" y2="18" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
  </svg>
);

/* PLAZA NG MALIKHAING DIWA — Burnay (Traditional Pottery)
   (creativity, arts) */
const IconMalikhaing = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    {/* Pot silhouette */}
    <path d="M10 7 C10 7 8 11 6 15 C4 19 8 22 13 22 C18 22 22 19 20 15 C18 11 16 7 16 7"
      stroke={color} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
    <ellipse cx="13" cy="7" rx="3" ry="1.5" stroke={color} strokeWidth="1.3" />
    {/* Decorative etched lines */}
    <path d="M7.5 14 Q13 12 18.5 14" stroke={color} strokeWidth="1" opacity="0.6" strokeLinecap="round" />
    <path d="M8 17 Q13 15.5 18 17" stroke={color} strokeWidth="1" opacity="0.6" strokeLinecap="round" />
    {/* Paint brush accent */}
    <path d="M17 7 Q21 4 21 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="21" cy="5" r="1.5" fill={color} opacity="0.6" />
  </svg>
);

/* DAMBANA NG PAGKAKAISA — Bayanihan (Carrying the Kubo)
   (unity, community) */
const IconPagkakaisa = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    {/* Kubo Outline */}
    <path d="M9 10 L13 6 L17 10 L16 10 L16 13 L10 13 L10 10 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    {/* Carrying pole */}
    <line x1="4" y1="15" x2="22" y2="15" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    {/* Support beams */}
    <line x1="11" y1="13" x2="11" y2="15" stroke={color} strokeWidth="1.3" />
    <line x1="15" y1="13" x2="15" y2="15" stroke={color} strokeWidth="1.3" />
    {/* Left figure */}
    <path d="M6 21 L6 16 M4 17 L6 15 L8 17" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="13" r="1.5" fill={color} opacity="0.6" />
    {/* Right figure */}
    <path d="M20 21 L20 16 M18 17 L20 15 L22 17" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="13" r="1.5" fill={color} opacity="0.6" />
  </svg>
);

/* PALAISDAAN NG KALUSUGAN — Dikdikan (Mortar, Pestle & Herbs)
   (health, wellness, traditional medicine) */
const IconKalusugan = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    {/* Mortar */}
    <path d="M6 14 L8 20 Q13 23 18 20 L20 14" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    <ellipse cx="13" cy="14" rx="7" ry="2.5" stroke={color} strokeWidth="1.3" />
    {/* Pestle */}
    <path d="M15 6 L12 16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="15.5" cy="5.5" r="1.5" fill={color} opacity="0.6" />
    {/* Herbal Leaves (Lagundi motif) */}
    <path d="M6 11 C6 6 10 7 10 11 C10 14 6 13 6 11 Z" stroke={color} strokeWidth="1" opacity="0.7" />
    <path d="M20 11 C20 6 16 7 16 11 C16 14 20 13 20 11 Z" stroke={color} strokeWidth="1" opacity="0.7" />
  </svg>
);

/* BAHAY NG BAYANIHAN — Bahay Kubo with Heart
   (community service, shelter) */
const IconBayanihan = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    {/* Roof */}
    <path d="M3 12 L13 4 L23 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    {/* House body */}
    <path d="M6 11 L6 21 L20 21 L20 11" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    {/* Bamboo stilts/accents */}
    <line x1="4" y1="21" x2="22" y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    {/* Glowing Heart inside */}
    <path d="M13 18 C13 18 8.5 15 8.5 12.5 C8.5 10.5 10.5 9.5 11.5 10.5 C12.5 11.5 13 13 13 13 C13 13 13.5 11.5 14.5 10.5 C15.5 9.5 17.5 10.5 17.5 12.5 C17.5 15 13 18 13 18 Z"
      fill={color} opacity="0.7" />
  </svg>
);
/* ════════════════════════════════════════════
   SUBTHEME CONFIG — 7 entries with palette colors
   ════════════════════════════════════════════ */
interface SubthemeMeta {
  key: string;
  label: string;
  sublabel: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  textColor: string;
  Icon: React.ComponentType<{ color: string }>;
}

const SUBTHEMES: SubthemeMeta[] = [
  {
    key: 'all',
    label: 'All Themes',
    sublabel: '',
    bgColor: '#006937',
    iconColor: '#fae185',
    borderColor: 'rgba(250,225,133,0.45)',
    textColor: '#fae185',
    Icon: IconAllThemes,
  },
  {
    key: 'Palayan ng Karunungan',
    label: 'Palayan ng',
    sublabel: 'Karunungan',
    bgColor: 'rgba(201,224,228,0.15)',
    iconColor: '#C9E0E4',
    borderColor: 'rgba(201,224,228,0.3)',
    textColor: '#C9E0E4',
    Icon: IconKarunungan,
  },
  {
    key: 'Pamilihan ng Kakayahan',
    label: 'Pamilihan ng',
    sublabel: 'Kakayahan',
    bgColor: 'rgba(250,225,133,0.12)',
    iconColor: '#fae185',
    borderColor: 'rgba(250,225,133,0.3)',
    textColor: '#fae185',
    Icon: IconKakayahan,
  },
  {
    key: 'Plaza ng Malikhaing Diwa',
    label: 'Plaza ng',
    sublabel: 'Malikhaing Diwa',
    bgColor: 'rgba(139,74,6,0.2)',
    iconColor: '#d4956a',
    borderColor: 'rgba(139,74,6,0.45)',
    textColor: '#d4956a',
    Icon: IconMalikhaing,
  },
  {
    key: 'Dambana ng Pagkakaisa',
    label: 'Dambana ng',
    sublabel: 'Pagkakaisa',
    bgColor: 'rgba(22,164,96,0.15)',
    iconColor: '#16a460',
    borderColor: 'rgba(22,164,96,0.35)',
    textColor: '#4ecf8a',
    Icon: IconPagkakaisa,
  },
  {
    key: 'Palaisdaan ng Kalusugan',
    label: 'Palaisdaan ng',
    sublabel: 'Kalusugan',
    bgColor: 'rgba(153,217,235,0.12)',
    iconColor: '#99d9eb',
    borderColor: 'rgba(153,217,235,0.3)',
    textColor: '#99d9eb',
    Icon: IconKalusugan,
  },
  {
    key: 'Bahay ng Bayanihan',
    label: 'Bahay ng',
    sublabel: 'Bayanihan',
    bgColor: 'rgba(239,230,173,0.12)',
    iconColor: '#efe6ad',
    borderColor: 'rgba(239,230,173,0.3)',
    textColor: '#efe6ad',
    Icon: IconBayanihan,
  },
];

/* ════════════════════════════════════════════
/* ════════════════════════════════════════════
   MAIN HOME COMPONENT
   ════════════════════════════════════════════ */
export default function Home({
  user,
  filteredAndSortedClasses, uniqueDays, onDaySelect,
  viewingClass, onClassSelect, onSignIn, HeroSection, HeroExtras, renderClassCard,
}: HomeProps) {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const isDesktop = w >= 1024;
  const stickyTop = isDesktop ? 168 : isMobile ? 110 : 134;

  // Declare state first (before useMemo that uses selectedSubtheme)
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubtheme, setSelectedSubtheme] = useState<string | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const displayedDays = useMemo(() => uniqueDays, [uniqueDays]);

  const classesByDay = useMemo(() => {
    const grouped: Record<string, LeapClass[]> = {};
    const filtered = selectedSubtheme
      ? filteredAndSortedClasses.filter(cls => cls.subtheme === selectedSubtheme)
      : filteredAndSortedClasses;
    filtered.forEach(cls => {
      if (!grouped[cls.date]) grouped[cls.date] = [];
      grouped[cls.date].push(cls);
    });
    return grouped;
  }, [filteredAndSortedClasses, selectedSubtheme]);

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
    setActiveDay(day); onDaySelect(day);
  }, [onDaySelect]);

  const toggleDayExpanded = useCallback((day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  }, []);

  useEffect(() => {
    document.body.style.overflow = viewingClass ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [viewingClass]);

  return (
    <main className="flex-grow hero-bg"
      style={{ position: 'relative', overflow: 'clip', isolation: 'isolate' }}>

      <style>{`
        @keyframes leapBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>

      {/* Fireflies */}
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

        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 15%, rgba(191,110,25,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {HeroSection}
        </section>

        {/* Subthemes display via HeroExtras */}
        {HeroExtras}

        {/* ══ CLASS CATALOG ══ */}
        <section id="classes-section" style={{
          padding: isMobile ? '1.5rem 0 5rem' : '3rem 0 7rem',
          position: 'relative',
          minHeight: '100vh',
          background: 'transparent',
        }}>
          <ThemeBackground selectedSubtheme={selectedSubtheme} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 0%, rgba(191,110,25,0.3) 15%, rgba(250,225,133,0.7) 50%, rgba(191,110,25,0.3) 85%, transparent 100%)',
          }} />

          <div style={{
            maxWidth: 1260, margin: '0 auto',
            padding: `0 clamp(0.75rem, 3vw, 1.75rem)`,
            boxSizing: 'border-box', width: '100%',
          }}>
            <CatalogHeader />

            {/* Subtheme filter pills */}
            <SubthemeFilterPills
              selectedSubtheme={selectedSubtheme}
              onSubthemeSelect={(val) => {
                const el = document.getElementById('classes-section');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - (isMobile ? 100 : 140);
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '240px 1fr' : '1fr',
              gap: isMobile ? '1rem' : '1.75rem',
              alignItems: 'start', position: 'relative',
            }}>

              {/* ── Sidebar (desktop) ── */}
              {isDesktop && (
                <aside style={{
                  ...surface,
                  padding: '1.4rem 1.1rem 1.3rem',
                  position: 'sticky', top: `${stickyTop}px`,
                  maxHeight: `calc(100vh - ${stickyTop + 24}px)`,
                  overflowY: 'auto', alignSelf: 'start',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(191,110,25,0.25) transparent',
                }}>
                  <AccentLine />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                    <p style={{
                      fontFamily: "'Tropikal', 'Playfair Display', serif",
                      fontSize: '1.1rem', fontWeight: 700, color: '#2e1e08', margin: 0,
                    }}>LEAP Days</p>
                    <SunOrnament size={28} opacity={0.2} />
                  </div>
                  <p style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.2em', color: '#bf6e19', margin: 0,
                  }}>2026</p>
                  <DiamondDivider />
                  <p style={{ fontSize: '0.72rem', color: '#7a6040', fontWeight: 500, lineHeight: 1.5, marginBottom: '1rem' }}>
                    Jump to a day's classes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {displayedDays.map((day, idx) => {
                      const isActive = activeDay === day;
                      const count = classesByDay[day]?.length ?? 0;
                      return (
                        <button key={day} onClick={() => scrollToDay(day)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 0.7rem', borderRadius: 13,
                          border: isActive ? '1px solid rgba(191,110,25,0.45)' : '1px solid rgba(191,110,25,0.12)',
                          background: isActive
                            ? 'linear-gradient(145deg, rgba(254,246,220,0.95), rgba(252,240,200,0.92))'
                            : 'rgba(255,253,245,0.45)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          textAlign: 'left', width: '100%', position: 'relative',
                          boxShadow: isActive ? '0 4px 16px rgba(160,100,20,0.12), 0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
                        }}>
                          {isActive && (
                            <div style={{
                              position: 'absolute', left: -1, top: '18%', bottom: '18%',
                              width: 3, borderRadius: 99,
                              background: 'linear-gradient(180deg, #fae185, #bf6e19, #8b4a06)',
                            }} />
                          )}
                          <DayBadge num={idx + 1} active={isActive} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
                              letterSpacing: '0.14em', color: isActive ? '#8b4a06' : '#8a7050', display: 'block',
                            }}>Day {String(idx + 1).padStart(2, '0')}</span>
                            <span style={{
                              fontFamily: "'Tropikal', 'Playfair Display', serif",
                              fontSize: '0.88rem', fontWeight: 700,
                              color: isActive ? '#2e1e08' : '#5a4030',
                              display: 'block', marginTop: '0.08rem',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{day}</span>
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              color: isActive ? '#bf6e19' : '#9a7a50',
                              display: 'block', marginTop: '0.06rem',
                            }}>{count} {count === 1 ? 'class' : 'classes'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{
                    marginTop: '1rem', paddingTop: '0.8rem',
                    borderTop: '1px solid rgba(191,110,25,0.18)',
                    display: 'flex', justifyContent: 'center',
                  }}>
                    <SunOrnament size={26} opacity={0.22} />
                  </div>
                </aside>
              )}

              {/* ── Main content ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.75rem', minWidth: 0 }}>

                {/* Mobile day selector */}
                {isMobile && displayedDays.length > 0 && (
                  <div style={{ ...surface, padding: '1rem 1.1rem' }}>
                    <AccentLine />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block', fontSize: '0.58rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.18em',
                          color: '#bf6e19', marginBottom: '0.45rem',
                        }}>Select Day</label>
                        <select
                          value={activeDay || ''}
                          onChange={e => {
                            const day = e.target.value;
                            if (day && displayedDays.includes(day)) {
                              setActiveDay(day); setViewMode('grid'); scrollToDay(day);
                            }
                          }}
                          style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
                            border: '1.5px solid rgba(191,110,25,0.35)',
                            background: 'rgba(255,252,243,0.95)',
                            fontFamily: "'Tropikal', 'Playfair Display', serif",
                            fontSize: '0.92rem', fontWeight: 700, color: '#2e1e08',
                            cursor: 'pointer', boxSizing: 'border-box',
                            boxShadow: '0 2px 8px rgba(120,80,20,0.07)', appearance: 'none',
                          }}>
                          {displayedDays.map((day, idx) => (
                            <option key={day} value={day}>
                              Day {String(idx + 1).padStart(2, '0')} — {day}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(191,110,25,0.25)' }}>
                        {(['grid', 'list'] as const).map(mode => (
                          <button key={mode} onClick={() => setViewMode(mode)} title={`${mode} view`} style={{
                            padding: '0.62rem 0.7rem',
                            background: viewMode === mode ? 'rgba(191,110,25,0.15)' : 'transparent',
                            border: 'none',
                            borderRight: mode === 'grid' ? '1px solid rgba(191,110,25,0.2)' : 'none',
                            cursor: 'pointer', transition: 'all 0.18s',
                            color: viewMode === mode ? '#bf6e19' : '#a08060',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sign-in gate */}
                {!user ? (
                  <div style={{ ...surface, padding: isMobile ? '2.5rem 1.25rem' : '4rem 2.5rem', textAlign: 'center' }}>
                    <AccentLine bright />
                    <div style={{
                      width: 64, height: 64, margin: '0 auto 1.5rem', borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(191,110,25,0.15), rgba(191,110,25,0.08))',
                      border: '1px solid rgba(191,110,25,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SunOrnament size={34} opacity={0.55} />
                    </div>
                    <h3 style={{
                      fontFamily: "'Tropikal', 'Playfair Display', serif",
                      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: '#2e1e08', marginBottom: '0.6rem',
                    }}>Sign in to see classes</h3>
                    <p style={{ color: '#6a5030', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 2rem' }}>
                      Use your DLSU account to view and register for LEAP 2026 classes.
                    </p>
                    <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '0.9rem', borderRadius: 14 }}>
                      Sign In with DLSU
                    </button>
                  </div>

                ) : displayedDays.length === 0 ? (
                  <div style={{ ...surface, padding: '3rem 2rem', textAlign: 'center' }}>
                    <AccentLine />
                    <p style={{ color: '#7a6040', fontSize: '0.95rem' }}>No classes available.</p>
                  </div>

                ) : isMobile ? (
                  activeDay && classesByDay[activeDay] ? (
                    <div>
                      <div style={{ marginBottom: '0.85rem', paddingLeft: '0.1rem' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#bf6e19', margin: '0 0 0.2rem' }}>
                          Day {String(displayedDays.indexOf(activeDay) + 1).padStart(2, '0')}
                        </p>
                        <h2 style={{
                          fontFamily: "'Tropikal', 'Playfair Display', serif",
                          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 700, color: '#2e1e08', margin: '0 0 0.25rem',
                        }}>{activeDay}</h2>
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
                  displayedDays.map((day, idx) => {
                    const dayClasses = classesByDay[day] ?? [];
                    const isExpanded = !!expandedDays[day];
                    const hasMore = dayClasses.length > CLASSES_PER_DAY;
                    const visible = isExpanded ? dayClasses : dayClasses.slice(0, CLASSES_PER_DAY);
                    const hidden = dayClasses.length - CLASSES_PER_DAY;
                    const isActive = activeDay === day;

                    return (
                      <div key={day} ref={el => { daySectionRefs.current[day] = el; }} style={{
                        ...surface, padding: 0, scrollMarginTop: '6rem', overflow: 'hidden',
                        border: isActive ? '1px solid rgba(191,110,25,0.38)' : '1px solid rgba(191,110,25,0.18)',
                        boxShadow: isActive
                          ? '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px rgba(140,90,20,0.1), 0 2px 8px rgba(140,90,20,0.06)'
                          : surface.boxShadow,
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                      }}>
                        <AccentLine bright={isActive} />
                        <div style={{
                          padding: '1.4rem 1.6rem 1rem',
                          borderBottom: '1px solid rgba(191,110,25,0.15)',
                          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <DayBadge num={idx + 1} active={isActive} />
                            <div>
                              <p style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#bf6e19', margin: '0 0 0.18rem' }}>
                                Day {String(idx + 1).padStart(2, '0')}
                              </p>
                              <h2 style={{
                                fontFamily: "'Tropikal', 'Playfair Display', serif",
                                fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', fontWeight: 700, color: '#2e1e08', margin: 0, lineHeight: 1.05,
                              }}>{day}</h2>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                            <PalayOrnament flip />
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? '#bf6e19' : '#9a7a50', textAlign: 'right' }}>
                              {dayClasses.length}<br />{dayClasses.length === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                          {dayClasses.length === 0 ? (
                            <p style={{ color: '#9a7a50', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>No classes on this day.</p>
                          ) : (
                            <>
                              <div className={styles.classGrid}>
                                {visible.map((cls, cIdx) => renderClassCard(cls, cIdx))}
                              </div>
                              {hasMore && (
                                <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                                  <button onClick={() => toggleDayExpanded(day)} style={{
                                    padding: '0.65rem 1.35rem', borderRadius: 10,
                                    border: '1px solid rgba(191,110,25,0.28)',
                                    background: 'rgba(250,225,133,0.1)',
                                    color: '#bf6e19', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.18s',
                                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                                  }}>
                                    {isExpanded
                                      ? <><ChevronUp size={14} /> Show Less</>
                                      : <><ChevronDown size={14} /> See {hidden} More {hidden === 1 ? 'Class' : 'Classes'}</>}
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

        {/* Modal */}
        {user && viewingClass && createPortal(
          <ClassModal cls={viewingClass} onClose={() => onClassSelect(null)} isMobile={isMobile} w={w} />,
          document.body
        )}
      </div>
    </main>
  );
}

/* ─── Mobile list card ─── */
function MobileListCard({ cls, surface, onSelect }: {
  cls: LeapClass; surface: React.CSSProperties; onSelect: (c: LeapClass) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onSelect(cls)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        ...surface, padding: '0.85rem', display: 'flex', gap: '0.7rem',
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(120,80,20,0.12)' : surface.boxShadow,
      }}>
      <div style={{ width: 68, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(191,110,25,0.08)' }}>
        <img src={cls.image} alt={cls.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bf6e19', margin: 0 }}>
          {cls.org}
        </p>
        <h3 style={{
          fontFamily: "'Tropikal', 'Playfair Display', serif",
          fontSize: '0.88rem', fontWeight: 700, color: '#2e1e08', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.25,
        }}>{cls.title}</h3>
        <p style={{ fontSize: '0.68rem', color: '#6a5030', margin: 0 }}>{cls.date} · {cls.slots} slots</p>
      </div>
    </div>
  );
}

/* ─── Class detail modal ─── */
function ClassModal({ cls, onClose, isMobile, w }: {
  cls: LeapClass; onClose: () => void; isMobile: boolean; w: number;
}) {
  const twoCol = w >= 640;

  /* Find subtheme color for badge */
  const subthemeMeta = SUBTHEMES.find(s => s.key === cls.subtheme);
  const badgeColor = subthemeMeta?.iconColor ?? '#bf6e19';
  const badgeBorder = subthemeMeta?.borderColor ?? 'rgba(191,110,25,0.4)';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(10,8,5,0.82)', backdropFilter: 'blur(8px)',
      padding: isMobile ? 0 : 'clamp(0.75rem, 2vw, 1.5rem)',
      overflow: 'hidden', display: 'grid', placeItems: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: isMobile ? '100vw' : 'min(1020px, 96vw)',
        maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 2rem)',
        height: isMobile ? '100dvh' : 'auto',
        background: 'linear-gradient(175deg, #fffdf6 0%, #f8efcf 100%)',
        borderRadius: isMobile ? 0 : 20, overflow: 'auto',
        border: isMobile ? 'none' : '1px solid rgba(191,110,25,0.3)',
        boxShadow: isMobile ? 'none' : '0 28px 80px rgba(30,18,5,0.28), 0 0 0 1px rgba(255,255,255,0.08) inset',
        position: 'relative',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14, zIndex: 20,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,252,240,0.95)', border: '1px solid rgba(191,110,25,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#3a2210',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.18s',
        }}>
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: twoCol ? 'min(320px, 36%) 1fr' : '1fr' }}>
          {/* Image */}
          <div style={{ position: 'relative', minHeight: twoCol ? 320 : 220, maxHeight: twoCol ? 'none' : 260, overflow: 'hidden' }}>
            <img src={cls.image} alt={cls.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              referrerPolicy="no-referrer" />
            <div style={{
              position: 'absolute', inset: 0,
              background: twoCol
                ? 'linear-gradient(to right, transparent 60%, rgba(254,251,238,0.6) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)',
            }} />
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {cls.orgLogo && (
                <img src={cls.orgLogo} alt={cls.org}
                  style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(191,110,25,0.55)' }}
                  referrerPolicy="no-referrer" />
              )}
              {/* Subtheme — display only, colored per theme */}
              {cls.subtheme && (
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(10,8,5,0.55)',
                  border: `1px solid ${badgeBorder}`,
                  color: badgeColor, fontSize: '0.6rem',
                  fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase', backdropFilter: 'blur(6px)',
                }}>{cls.subtheme}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{
            padding: isMobile ? '1.1rem 1.1rem 1.5rem' : 'clamp(1.25rem, 2.5vw, 2rem)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800,
                color: '#2e1e08', lineHeight: 1.1, marginBottom: '0.4rem',
              }}>{cls.title}</h1>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bf6e19' }}>
                Organized by {cls.org}
              </p>
            </div>

            {/* Meta chips — Filipino cultural icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { icon: <IconParaw size={15} />, label: 'Date & Time', val: `${cls.date} · ${cls.time}` },
                { icon: <IconBahayKubo size={15} />, label: 'Location', val: `${cls.venue} (${cls.modality})` },
                { icon: <IconSampaguita size={15} />, label: 'Slots', val: `${cls.slots} participants` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(191,110,25,0.1)', border: '1px solid rgba(191,110,25,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bf6e19',
                  }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9a7a50', margin: '0 0 2px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontWeight: 600, color: '#2e1e08', fontSize: '0.86rem', margin: 0 }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid rgba(191,110,25,0.2)', paddingTop: '1rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#2e1e08', marginBottom: '0.55rem' }}>
                About this class
              </h3>
              <p style={{ color: '#5a4030', lineHeight: 1.8, fontSize: '0.92rem' }}>
                {cls.description || 'No description provided.'}
              </p>
            </div>

            {/* CTA */}
            <a href={cls.googleFormUrl || '#'} target="_blank" rel="noopener noreferrer"
              className="btn-leap-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '0.88rem 1.75rem', borderRadius: 13,
                fontSize: '0.88rem', textDecoration: 'none',
                width: isMobile ? '100%' : 'fit-content',
              }}>
              Register via Google Forms <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}