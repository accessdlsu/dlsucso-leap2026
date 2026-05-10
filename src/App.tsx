/**
   * @license
   * SPDX-License-Identifier: Apache-2.0
   */
import {
  auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged
} from './services/firebase';
import { useState, useEffect, useRef, useMemo, Suspense, lazy, type CSSProperties, type ErrorInfo, type ReactNode, Component } from 'react';
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import {
  Calendar, MapPin, Users, ChevronRight, ChevronLeft,
  X, AlertCircle, LogIn,
  Edit, ArrowLeft, ExternalLink, Palette, Mail, Clock, ChevronUp,
  BookOpen, Wrench, Handshake, HeartPulse, ArrowDown
} from 'lucide-react';
import { optimizeContentfulImage } from './utils';
import { contentfulClient } from './services/contentful';
import type { User as FirebaseUser } from "firebase/auth";

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MainEvents = lazy(() => import('./pages/MainEvents'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Classes = lazy(() => import('./pages/Classes'));
const SavedClasses = lazy(() => import('./pages/SavedClasses'));
const NayonScene = lazy(() => import('./components/NayonScene'));

import { ClassCard, Navbar, Footer } from './components';
import { SubthemeLandscape } from './components/SubthemeLandscape';
import leapLogo from './assets/leap.webp';
import styles from './App.module.css';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle className="mx-auto text-leap-maroon mb-4" size={48} />
            <h2 className={styles.errorTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Something went wrong</h2>
            <p className={styles.errorMessage}>We encountered an unexpected error. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className={styles.errorButton}>Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════
  SCROLL PROGRESS BAR
══════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const upd = () => {
      const el = document.documentElement;
      setPct(el.scrollTop / (el.scrollHeight - el.clientHeight));
    };
    window.addEventListener('scroll', upd);
    return () => window.removeEventListener('scroll', upd);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: 'none', background: 'rgba(222,154,73,0.12)' }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#803e2f,#de9a49,#803e2f)', transition: 'width 0.1s linear', boxShadow: '0 0 8px rgba(222,154,73,0.8)' }} />
    </div>
  );
};



/* ══════════════════════════════════════════════════════
  FIREFLIES
══════════════════════════════════════════════════════ */
const FLIES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i * 17.3 + (i % 3) * 29) % 94 + 3,
  y: (i * 11.7 + (i % 5) * 13) % 55 + 5,
  size: 2 + (i % 3),
  delay: (i * 0.61) % 7,
  dur: 3.5 + (i % 5) * 0.6,
  driftX: ((i % 7) - 3) * 28,
  driftY: ((i % 5) - 2) * 20,
}));

const Fireflies = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
    {FLIES.map(f => (
      <div
        key={f.id}
        className="firefly"
        style={{
          left: `${f.x}%`,
          top: `${f.y}%`,
          width: f.size,
          height: f.size,
          animationDuration: `${f.dur}s, ${f.dur * 0.6}s`,
          animationDelay: `${f.delay}s, ${f.delay}s`,
          transform: `translate(0, 0)`,
          boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.7)`,
        } as CSSProperties}
      />
    ))}
  </div>
);
// Lazy Rendering Wrapper Component
const LazySection = ({ children, minHeight = 600 }: { children: ReactNode; minHeight?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: minHeight }}>
      {visible ? children : null}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
  THE AWAKENING — cinematic dawn transition scene
══════════════════════════════════════════════════════ */
const TheAwakening = () => {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, 1 - (rect.top + rect.height / 2) / (vh + rect.height / 2)));
      setProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(560px, 78vh, 760px)',
        overflow: 'hidden',
        background: `
            linear-gradient(180deg,
              #0d1f1c 0%,
              #122830 12%,
              #1a3a42 24%,
              #2a5058 36%,
              #3d6e78 48%,
              #5a8a88 58%,
              #7aa090 68%,
              #9ab888 76%,
              #c8b878 84%,
              #d4a858 92%,
              #c89848 100%
            )
          `,
      }}
    >
      {/* === Stars (fade out as user scrolls down) === */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - progress * 1.5 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const x = (i * 37.3 + (i % 5) * 11) % 98 + 1;
          const y = (i * 9.7) % 24 + 2;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                borderRadius: '50%',
                background: '#fae185',
                opacity: 0.2 + (i % 4) * 0.15,
                boxShadow: '0 0 6px rgba(250,225,133,0.6)',
                animation: `starTwinkle ${2 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
                animationDelay: `${(i * 0.2) % 3}s`,
              }}
            />
          );
        })}
      </div>

      {/* === The Rising Sun === */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          transform: `translate(-50%, -50%) translateY(${(1 - progress) * 60}px)`,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,225,140,0.95) 0%, rgba(250,190,100,0.5) 35%, rgba(222,154,73,0.2) 60%, transparent 80%)',
          filter: 'blur(2px)',
          animation: 'sunGlow 6s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          transform: `translate(-50%, -50%) translateY(${(1 - progress) * 60}px)`,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff4c4 0%, #f7d580 40%, #de9a49 90%)',
          boxShadow: '0 0 100px 30px rgba(255,215,130,0.55)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* === Drifting Clouds === */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: '18%', left: 0, width: '100%', height: '22%', zIndex: 3, pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id="cloudG" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,240,210,0.85)" />
            <stop offset="100%" stopColor="rgba(255,240,210,0)" />
          </radialGradient>
        </defs>
        <g className="cloud-drift-slow">
          <ellipse cx="220" cy="80" rx="180" ry="32" fill="url(#cloudG)" opacity="0.7" />
          <ellipse cx="280" cy="60" rx="120" ry="22" fill="url(#cloudG)" opacity="0.5" />
        </g>
        <g className="cloud-drift-med">
          <ellipse cx="780" cy="120" rx="210" ry="36" fill="url(#cloudG)" opacity="0.55" />
          <ellipse cx="850" cy="100" rx="140" ry="24" fill="url(#cloudG)" opacity="0.4" />
        </g>
        <g className="cloud-drift-fast">
          <ellipse cx="1280" cy="90" rx="160" ry="28" fill="url(#cloudG)" opacity="0.6" />
        </g>
      </svg>

      {/* === V-Formation of Migrating Birds === */}
      <div
        style={{
          position: 'absolute',
          top: '28%',
          left: 0,
          width: '100%',
          height: 80,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <div className="bird-formation">
          <svg viewBox="0 0 120 60" width="120" height="60">
            {[
              [60, 30], [45, 20], [75, 20], [30, 10], [90, 10], [15, 0], [105, 0],
            ].map(([cx, cy], i) => (
              <path
                key={i}
                d={`M${cx - 7} ${cy + 2} Q${cx - 3.5} ${cy - 4} ${cx} ${cy} Q${cx + 3.5} ${cy - 4} ${cx + 7} ${cy + 2}`}
                fill="none"
                stroke="rgba(60,40,20,0.72)"
                strokeWidth="1.8"
                strokeLinecap="round"
                className={`bird-flap bird-flap-d${i % 3}`}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* === Distant Mountain Silhouettes === */}
      <svg
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: '32%', left: 0, width: '100%', height: '28%', zIndex: 5, pointerEvents: 'none' }}
      >
        <path
          d="M0 180 L80 140 L160 165 L240 120 L340 150 L440 100 L560 130 L680 95 L820 125 L960 105 L1080 135 L1200 115 L1320 140 L1440 120 L1440 300 L0 300 Z"
          fill="rgba(50,75,90,0.55)"
        />
        <path
          d="M0 220 L120 180 L240 200 L360 160 L500 195 L640 170 L780 195 L920 175 L1060 200 L1200 180 L1320 205 L1440 195 L1440 300 L0 300 Z"
          fill="rgba(40,65,75,0.75)"
        />
        <path
          d="M0 250 L140 220 L260 235 L400 210 L520 230 L660 215 L820 235 L960 220 L1100 240 L1240 225 L1360 245 L1440 235 L1440 300 L0 300 Z"
          fill="rgba(28,48,52,0.92)"
        />
        {[[340, 236], [680, 226], [980, 232], [1180, 240]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <path d={`M0 0 L-6 -8 L6 -8 Z`} fill="#1a2a24" />
            <rect x="-5" y="-8" width="10" height="8" fill="#1a2a24" />
            <rect x="-2" y="-6" width="3" height="3" fill="#fae185" opacity="0.7" className={`window-flicker window-flicker-d${i % 2}`} />
          </g>
        ))}
      </svg>

      {/* === Rising Paper Lanterns === */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        {[
          { x: 18, delay: 0, size: 22, dur: 14 },
          { x: 34, delay: 4, size: 16, dur: 16 },
          { x: 68, delay: 2, size: 20, dur: 15 },
          { x: 82, delay: 6, size: 14, dur: 17 },
          { x: 52, delay: 8, size: 18, dur: 15.5 },
        ].map((p, i) => (
          <div
            key={i}
            className="parol-rise"
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              bottom: '-40px',
              width: p.size,
              height: p.size * 1.2,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '80%',
                borderRadius: '40%',
                background: 'radial-gradient(circle at 50% 40%, #ffd980 0%, #de9a49 65%, #a05820 100%)',
                boxShadow: '0 0 18px 4px rgba(255,200,100,0.65), 0 0 38px 10px rgba(222,154,73,0.4)',
                position: 'relative',
              }}
            />
            <div
              style={{
                width: 2,
                height: '22%',
                background: 'rgba(100,50,20,0.6)',
                margin: '0 auto',
              }}
            />
          </div>
        ))}
      </div>

      {/* === Valley Mist === */}
      <div
        style={{
          position: 'absolute',
          bottom: '24%',
          left: 0,
          right: 0,
          height: '14%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,240,210,0.28) 50%, rgba(255,240,210,0.1) 100%)',
          filter: 'blur(3px)',
          zIndex: 7,
          pointerEvents: 'none',
        }}
      />

      {/* === River with ripple reflections === */}
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '26%', zIndex: 8, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="riverG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e3c48c" />
            <stop offset="40%" stopColor="#b59868" />
            <stop offset="100%" stopColor="#6b5838" />
          </linearGradient>
          <linearGradient id="rippleG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,240,210,0)" />
            <stop offset="50%" stopColor="rgba(255,240,210,0.55)" />
            <stop offset="100%" stopColor="rgba(255,240,210,0)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="180" fill="url(#riverG)" />
        {[20, 55, 90, 130].map((y, i) => (
          <path
            key={i}
            d={`M0 ${y} Q180 ${y - 3} 360 ${y} T720 ${y} T1080 ${y} T1440 ${y}`}
            stroke="url(#rippleG)"
            strokeWidth={1.2 + (i % 2) * 0.5}
            fill="none"
            className={`ripple-drift ripple-d${i}`}
            opacity={0.6 - i * 0.1}
          />
        ))}
        <ellipse cx="720" cy="50" rx="180" ry="6" fill="rgba(255,225,140,0.55)" className="sun-reflection" />
        <ellipse cx="720" cy="70" rx="120" ry="4" fill="rgba(255,225,140,0.35)" className="sun-reflection" />
      </svg>

      {/* === EMBEDDED MABUHAY GREETING === */}
      <MabuhayGreeting />

      {/* === Genshin-style swirling bottom transition === */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 120,
          zIndex: 9,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="awakeTransG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(200,152,72,0)" />
            <stop offset="40%" stopColor="rgba(180,130,55,0.55)" />
            <stop offset="100%" stopColor="#c89848" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="swirlL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,220,140,0)" />
            <stop offset="30%" stopColor="rgba(255,220,140,0.28)" />
            <stop offset="70%" stopColor="rgba(200,160,80,0.22)" />
            <stop offset="100%" stopColor="rgba(255,220,140,0)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="120" fill="url(#awakeTransG)" />
        <path d="M0 60 C200 40 400 80 600 55 C800 30 1000 70 1200 50 C1320 38 1400 55 1440 50"
          stroke="url(#swirlL)" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M0 75 C180 55 360 90 560 68 C760 45 960 82 1160 62 C1300 50 1400 68 1440 65"
          stroke="url(#swirlL)" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M0 90 C220 72 440 100 660 82 C880 62 1080 94 1280 78 C1360 72 1420 82 1440 80"
          stroke="url(#swirlL)" strokeWidth="1" fill="none" opacity="0.3" />
        {[120, 300, 520, 720, 940, 1160, 1340].map((x, i) => (
          <g key={i} transform={`translate(${x}, ${58 + (i % 3) * 10})`} opacity="0.5">
            <circle r="3" fill="rgba(255,215,120,0.7)" />
            <circle r="1.5" fill="rgba(255,240,180,0.9)" />
          </g>
        ))}
      </svg>

      {/* Local animation styles */}
      <style>{`
          @keyframes sunGlow {
            0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
            50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.08); }
          }
          @keyframes cloudDriftSlow {
            from { transform: translateX(-10%); }
            to   { transform: translateX(10%); }
          }
          @keyframes cloudDriftMed {
            from { transform: translateX(6%); }
            to   { transform: translateX(-6%); }
          }
          @keyframes cloudDriftFast {
            from { transform: translateX(-4%); }
            to   { transform: translateX(4%); }
          }
          .cloud-drift-slow { animation: cloudDriftSlow 42s ease-in-out infinite alternate; }
          .cloud-drift-med  { animation: cloudDriftMed 32s ease-in-out infinite alternate; }
          .cloud-drift-fast { animation: cloudDriftFast 22s ease-in-out infinite alternate; }

          @keyframes birdFormationFly {
            0%   { transform: translate(-12%, 8px) scale(0.9); opacity: 0; }
            10%  { opacity: 1; }
            50%  { transform: translate(50%, -14px) scale(1); }
            90%  { opacity: 1; }
            100% { transform: translate(112%, 6px) scale(0.9); opacity: 0; }
          }
          .bird-formation {
            animation: birdFormationFly 24s linear infinite;
          }

          @keyframes birdFlap {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-2px); }
          }
          .bird-flap      { animation: birdFlap 0.6s ease-in-out infinite; transform-origin: center; }
          .bird-flap-d0   { animation-delay: 0s; }
          .bird-flap-d1   { animation-delay: 0.15s; }
          .bird-flap-d2   { animation-delay: 0.3s; }

          @keyframes parolRise {
            0%   { transform: translateY(0) translateX(0); opacity: 0; }
            15%  { opacity: 0.9; }
            50%  { transform: translateY(-50vh) translateX(-6px); opacity: 1; }
            85%  { opacity: 0.7; }
            100% { transform: translateY(-100vh) translateX(10px); opacity: 0; }
          }
          .parol-rise { animation: parolRise linear infinite; }

          @keyframes rippleDrift {
            from { transform: translateX(0); }
            to   { transform: translateX(-40px); }
          }
          .ripple-drift { animation: rippleDrift 6s linear infinite; }
          .ripple-d0 { animation-duration: 5s; }
          .ripple-d1 { animation-duration: 7s; animation-direction: reverse; }
          .ripple-d2 { animation-duration: 6.2s; }
          .ripple-d3 { animation-duration: 8s; animation-direction: reverse; }

          @keyframes sunReflect {
            0%, 100% { opacity: 0.55; transform: scaleX(1); }
            50%      { opacity: 0.8;  transform: scaleX(1.1); }
          }
          .sun-reflection { animation: sunReflect 4s ease-in-out infinite; transform-origin: center; }
        `}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
  MABUHAY GREETING — embedded in The Awakening
══════════════════════════════════════════════════════ */
const MabuhayGreeting = () => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, 1 - (rect.top + rect.height * 0.6) / vh));
      setProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = Math.min(1, progress * 2);
  const mabuhayReveal = Math.max(0, Math.min(1, (progress - 0.15) * 2.2));
  const taglineReveal = Math.max(0, Math.min(1, (progress - 0.32) * 2.2));

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: 'clamp(140px, 22%, 240px)',
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        padding: '0 clamp(1rem, 4vw, 3rem)',
      }}
    >
      {/* Soft dark backdrop scrim */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(820px, 92vw)',
        height: 'clamp(220px, 30vh, 320px)',
        background: 'radial-gradient(ellipse at center, rgba(20,12,4,0.78) 0%, rgba(40,22,8,0.55) 35%, rgba(60,32,12,0.25) 60%, transparent 85%)',
        filter: 'blur(8px)',
        opacity: fadeIn,
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'opacity 0.4s',
      }} />

      {/* Concentric rings — Filipino sun motif */}
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, 85vw)',
          height: 'min(520px, 85vw)',
          opacity: fadeIn * 0.45,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        {[120, 175, 230].map((r, i) => (
          <circle key={i} cx="300" cy="300" r={r}
            fill="none"
            stroke="rgba(255,235,170,0.4)"
            strokeWidth="1"
            strokeDasharray={i % 2 === 0 ? "4 8" : "2 6"}
            style={{
              animation: `mabuhayRingPulse ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              transformOrigin: 'center',
            }}
          />
        ))}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line key={i}
              x1={300 + Math.cos(rad) * 90}
              y1={300 + Math.sin(rad) * 90}
              x2={300 + Math.cos(rad) * 240}
              y2={300 + Math.sin(rad) * 240}
              stroke="rgba(255,235,170,0.28)"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>

      {/* === Main content stack === */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        maxWidth: 'min(720px, 92vw)',
        width: '100%',
        pointerEvents: 'auto',
      }}>
        {/* Top decorative ornament */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(0.5rem, 1.5vw, 1rem)',
          marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)',
          opacity: fadeIn,
          transform: `translateY(${(1 - fadeIn) * 12}px)`,
          transition: 'opacity 0.4s, transform 0.4s',
        }}>
          <span style={{
            flex: '1 1 auto',
            minWidth: 30,
            maxWidth: 120,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,235,170,0.7))',
          }} />
          <svg width="20" height="20" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
            <g transform="translate(11,11)">
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <ellipse key={i}
                    cx={Math.cos(rad) * 5}
                    cy={Math.sin(rad) * 5}
                    rx="2.5" ry="1"
                    fill="rgba(255,235,170,0.95)"
                    transform={`rotate(${angle}, ${Math.cos(rad) * 5}, ${Math.sin(rad) * 5})`}
                  />
                );
              })}
              <circle r="2.2" fill="rgba(255,245,200,1)" />
            </g>
          </svg>
          <span style={{
            flex: '1 1 auto',
            minWidth: 30,
            maxWidth: 120,
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,235,170,0.7), transparent)',
          }} />
        </div>

        {/* "Mabuhay!" */}
        <h2 style={{
          fontFamily: "'Tropikal', 'Playfair Display', serif",
          fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
          fontWeight: 700,
          color: '#fff5c4',
          lineHeight: 0.95,
          margin: 0,
          letterSpacing: '0.01em',
          textShadow: '0 2px 0 rgba(80,40,10,0.5), 0 4px 24px rgba(0,0,0,0.85), 0 0 48px rgba(222,154,73,0.55), 0 0 80px rgba(0,0,0,0.6)',
          opacity: mabuhayReveal,
          transform: `translateY(${(1 - mabuhayReveal) * 28}px) scale(${0.88 + mabuhayReveal * 0.12})`,
          transition: 'opacity 0.4s, transform 0.5s',
          display: 'inline-block',
        }}>
          Mabuhay Lasallians!
        </h2>

        {/* Filipino subtitle + translation */}
        <div style={{
          opacity: taglineReveal,
          transform: `translateY(${(1 - taglineReveal) * 18}px)`,
          transition: 'opacity 0.5s, transform 0.5s',
          marginTop: 'clamp(0.85rem, 2vw, 1.5rem)',
        }}>
          <p style={{
            fontFamily: "'Tropikal', 'Playfair Display', serif",
            fontSize: 'clamp(0.95rem, 2vw, 1.45rem)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: '#ffeaa3',
            lineHeight: 1.4,
            margin: 0,
            letterSpacing: '0.02em',
            textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)',
            padding: '0 0.5rem',
          }}>
            Sa bawat dasal at bigkis ng palay,<br />
            may pag-asa, may bayanihan.
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(0.6rem, 1vw, 0.78rem)',
            fontWeight: 600,
            letterSpacing: 'clamp(0.16em, 0.5vw, 0.28em)',
            textTransform: 'uppercase',
            color: 'rgba(255,235,180,0.85)',
            marginTop: 'clamp(0.6rem, 1.2vw, 0.95rem)',
            padding: '0 0.5rem',
            textShadow: '0 1px 6px rgba(0,0,0,0.75)',
          }}>
            In every prayer and bundle of rice — there is hope, there is community.
          </p>
        </div>
      </div>

      <style>{`
          @keyframes mabuhayRingPulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50%      { transform: scale(1.04); opacity: 0.85; }
          }
        `}</style>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
  SCROLL INVITATION — minimalist chevron
══════════════════════════════════════════════════════ */
const ScrollInvitation = ({ onClick }: { onClick: () => void }) => (
  <m.button
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.9, duration: 0.55 }}
    aria-label="Halika"
    style={{
      position: 'absolute',
      bottom: 'clamp(1.25rem, 4vh, 3.1rem)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      zIndex: 12,
      padding: 'clamp(0.45rem, 1.3vh, 0.8rem) clamp(0.8rem, 1.6vw, 1.2rem)',
      minWidth: 'fit-content',
    }}
  >
    <m.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(0.35rem, 1vh, 0.6rem)',
        color: 'rgba(250,225,133,0.72)',
      }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        color: 'rgba(250,225,133,0.98)',
        fontSize: 'clamp(0.62rem, 0.95vw, 0.86rem)',
        fontWeight: 800,
        letterSpacing: 'clamp(0.18em, 0.35vw, 0.32em)',
        textTransform: 'uppercase',
        textShadow: '0 1px 10px rgba(0,0,0,0.75)',
      }}>
        Halika
      </span>
      <ArrowDown
        size={20}
        strokeWidth={2}
        style={{
          width: 'clamp(22px, 3vw, 38px)',
          height: 'clamp(22px, 3vw, 38px)',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
        }}
      />
    </m.div>
  </m.button>
);





/* ══════════════════════════════════════════════════════
  ANIMATED TAGLINE
══════════════════════════════════════════════════════ */
const AnimatedTagline = () => {
  const text = 'Isang Nayon, Isang Layunin';
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 48);
    return () => clearInterval(timer);
  }, []);

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="leap-tagline-wrap"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(0.45rem, 1vw, 0.6rem)',
        width: '100%',
        maxWidth: 'min(560px, 92vw)',
        margin: '0 auto',
        padding: '0 0.5rem',
        boxSizing: 'border-box',
        minHeight: 'clamp(140px, 18vw, 180px)',
      }}
    >
      <div className="leap-tagline-ornament" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.4rem, 1.5vw, 0.65rem)',
        width: '100%',
        maxWidth: 320,
        justifyContent: 'center',
      }}>
        <span style={{
          flex: '1 1 auto',
          minWidth: 24,
          maxWidth: 100,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.55), rgba(222,154,73,0.7))',
        }} />
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          <g transform="translate(7,7)">
            <path d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
              fill="rgba(250,225,133,0.85)" />
            <circle r="1.2" fill="rgba(255,245,200,0.95)" />
          </g>
        </svg>
        <span style={{
          flex: '1 1 auto',
          minWidth: 24,
          maxWidth: 100,
          height: 1,
          background: 'linear-gradient(90deg, rgba(222,154,73,0.7), rgba(222,154,73,0.55), transparent)',
        }} />
      </div>

      <span style={{
        fontFamily: "'Tropikal', 'Playfair Display', serif",
        textTransform: 'none',
        fontSize: 'clamp(1.4rem, 5.5vw, 2.4rem)',
        letterSpacing: '0.015em',
        color: '#ffeaa3',
        fontWeight: 700,
        fontStyle: 'italic',
        lineHeight: 1.15,
        textAlign: 'center',
        background: 'linear-gradient(180deg, #fff5c4 0%, #fae185 35%, #de9a49 75%, #b07820 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 2px 0 rgba(80,40,10,0.4), 0 4px 24px rgba(0,0,0,0.55), 0 0 48px rgba(222,154,73,0.4), 0 0 96px rgba(250,225,133,0.2)',
        filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(222,154,73,0.35))',
        padding: '0 0.25rem',
        minHeight: '1.15em',
        width: '100%',
        wordBreak: 'normal',
        overflowWrap: 'break-word',
        position: 'relative',
        display: 'inline-block',
      }}>
        {displayed}
        {!done && (
          <span style={{
            display: 'inline-block',
            width: 3,
            height: '0.9em',
            background: 'linear-gradient(180deg, #fff5c4, #de9a49)',
            marginLeft: 4,
            verticalAlign: 'middle',
            animation: 'cursorBlink 0.7s step-end infinite',
            boxShadow: '0 0 12px rgba(250,225,133,0.8), 0 0 24px rgba(222,154,73,0.5)',
            borderRadius: 1,
          }} />
        )}
      </span>
      <div style={{ minHeight: 'clamp(14px, 3vw, 20px)', display: 'flex', alignItems: 'center' }}></div>
      {done && (
        <m.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(0.55rem, 2.2vw, 0.72rem)',
            fontWeight: 600,
            letterSpacing: 'clamp(0.18em, 0.6vw, 0.32em)',
            textTransform: 'uppercase',
            color: 'rgba(232,200,122,0.72)',
            textAlign: 'center',
            padding: '0 0.5rem',
          }}>
          One Village · One Purpose
        </m.span>
      )}

      <div className="leap-tagline-ornament" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.4rem, 1.5vw, 0.65rem)',
        width: '100%',
        maxWidth: 380,
        justifyContent: 'center',
      }}>
        <span style={{
          flex: '1 1 auto',
          minWidth: 32,
          maxWidth: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.4))',
        }} />
        <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
          <circle cx="4" cy="4" r="1.5" fill="rgba(222,154,73,0.7)" />
        </svg>
        <span style={{
          flex: '1 1 auto',
          minWidth: 32,
          maxWidth: 140,
          height: 1,
          background: 'linear-gradient(90deg, rgba(222,154,73,0.4), transparent)',
        }} />
      </div>

      <style>{`
          @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
          @media (max-width: 480px) {
            .leap-tagline-wrap { gap: 0.35rem !important; }
            .leap-tagline-ornament { max-width: 240px !important; }
          }
        `}</style>
    </m.div>
  );
};

/* ══════════════════════════════════════════════════════
  SUBTHEMES
══════════════════════════════════════════════════════ */
const SUBTHEME_INFO: Record<string, { en: string; fil: string }> = {
  'Palayan ng Karunungan': { en: 'Expand your mind through academic and intellectual pursuits across sciences, humanities, and beyond.', fil: 'Palawakin ang kaalaman sa pamamagitan ng mga intelektwal na disiplina.' },
  'Pamilihan ng Kakayahan': { en: 'Sharpen practical skills and professional competencies — from technical know-how to workplace readiness.', fil: 'Palakasin ang kakayahan para sa propesyonal na mundo.' },
  'Plaza ng Malikhaing Diwa': { en: 'Unleash creativity through arts, design, performance, and free expression.', fil: 'Pahintulutan ang sariling lumikha sa sining at disenyo.' },
  'Dambana ng Pagkakaisa': { en: 'Build bridges and celebrate the bonds that bring our community together across all backgrounds.', fil: 'Itatag ang pagkakaisa at ipagdiwang ang pagkakaiba-iba.' },
  'Palaisdaan ng Kalusugan': { en: 'Nurture physical, mental, and emotional well-being through holistic health practices.', fil: 'Alagaan ang kalusugan sa lahat ng aspeto ng pamumuhay.' },
  'Bahay ng Bayanihan': { en: 'Experience community service, leadership, and collective action rooted in Filipino bayanihan spirit.', fil: 'Isabuhay ang diwa ng bayanihan at paglilingkod sa kapwa.' },
};

const SUBTHEMES: { label: string; icon: ReactNode }[] = [
  { label: 'Palayan ng Karunungan', icon: <BookOpen size={32} strokeWidth={1.8} /> },
  { label: 'Pamilihan ng Kakayahan', icon: <Wrench size={32} strokeWidth={1.8} /> },
  { label: 'Plaza ng Malikhaing Diwa', icon: <Palette size={32} strokeWidth={1.8} /> },
  { label: 'Dambana ng Pagkakaisa', icon: <Handshake size={32} strokeWidth={1.8} /> },
  { label: 'Palaisdaan ng Kalusugan', icon: <HeartPulse size={32} strokeWidth={1.8} /> },
  { label: 'Bahay ng Bayanihan', icon: <Users size={32} strokeWidth={1.8} /> },
];

/* ══════════════════════════════════════════════════════
  SUBTHEME ABOUT SECTION
══════════════════════════════════════════════════════ */
const SubthemeAboutSection = ({ onScrollToClasses }: { onScrollToClasses: () => void }) => {
  const [activeSubtheme, setActiveSubtheme] = useState<string | null>(null);

  const themeColors: Record<string, { iconBg: string; glow: string; border: string; text: string; accent: string }> = {
    'Palayan ng Karunungan': { iconBg: 'linear-gradient(135deg,#C9E0E4cc,#8ab8c0cc)', glow: 'rgba(201,224,228,0.4)', border: 'rgba(201,224,228,0.55)', text: '#C9E0E4', accent: '#a8d4dc' },
    'Pamilihan ng Kakayahan': { iconBg: 'linear-gradient(135deg,#fae185cc,#d4a838cc)', glow: 'rgba(250,225,133,0.4)', border: 'rgba(250,225,133,0.55)', text: '#fae185', accent: '#e8c84a' },
    'Plaza ng Malikhaing Diwa': { iconBg: 'linear-gradient(135deg,#d4956acc,#9a5828cc)', glow: 'rgba(212,149,106,0.4)', border: 'rgba(212,149,106,0.55)', text: '#d4956a', accent: '#c07840' },
    'Dambana ng Pagkakaisa': { iconBg: 'linear-gradient(135deg,#4ecf8acc,#16a460cc)', glow: 'rgba(78,207,138,0.35)', border: 'rgba(78,207,138,0.5)', text: '#4ecf8a', accent: '#2ab870' },
    'Palaisdaan ng Kalusugan': { iconBg: 'linear-gradient(135deg,#99d9ebcc,#4ab0c8cc)', glow: 'rgba(153,217,235,0.35)', border: 'rgba(153,217,235,0.5)', text: '#99d9eb', accent: '#6ac0d8' },
    'Bahay ng Bayanihan': { iconBg: 'linear-gradient(135deg,#efe6adcc,#c8b060cc)', glow: 'rgba(239,230,173,0.35)', border: 'rgba(239,230,173,0.5)', text: '#efe6ad', accent: '#d4c070' },
  };

  return (
    <>
      {/* ── Modal (UNCHANGED) ── */}
      <AnimatePresence>
        {activeSubtheme && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveSubtheme(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(4,8,4,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem,3vw,2rem)' }}
          >
            <m.div
              initial={{ scale: 0.86, y: 28, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 14, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'linear-gradient(160deg,#0a1a0c 0%,#122018 45%,#192c1e 100%)', border: `1.5px solid ${themeColors[activeSubtheme].border}`, borderRadius: 28, padding: 'clamp(2rem,5vw,3rem)', maxWidth: 500, width: '100%', position: 'relative', boxShadow: `0 0 80px ${themeColors[activeSubtheme].glow}, 0 32px 80px rgba(0,0,0,0.75)` }}
            >
              <button onClick={() => setActiveSubtheme(null)} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', transition: 'all 0.2s' }}>
                <X size={15} />
              </button>

              <div style={{ width: 68, height: 68, borderRadius: '50%', background: themeColors[activeSubtheme].iconBg, border: `2px solid ${themeColors[activeSubtheme].border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: `0 0 28px ${themeColors[activeSubtheme].glow}, inset 0 2px 6px rgba(255,255,255,0.22)`, color: '#1a1008', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.3) 0%, transparent 55%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{SUBTHEMES.find(s => s.label === activeSubtheme)?.icon}</div>
              </div>

              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.32em', textTransform: 'uppercase', color: themeColors[activeSubtheme].text, marginBottom: '0.4rem', opacity: 0.75 }}>Subtheme</p>
              <h2 style={{ fontFamily: "'Tropikal','Playfair Display',serif", fontSize: 'clamp(1.35rem,4vw,1.9rem)', fontWeight: 700, color: '#fff8e0', margin: '0 0 0.25rem', lineHeight: 1.15, textShadow: `0 0 32px ${themeColors[activeSubtheme].glow}` }}>
                {activeSubtheme}
              </h2>

              <div style={{ height: 1, background: `linear-gradient(90deg,${themeColors[activeSubtheme].border},transparent)`, margin: '1.1rem 0' }} />

              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(0.88rem,1.9vw,1rem)', color: 'rgba(249,236,182,0.82)', lineHeight: 1.78, marginBottom: '0.85rem' }}>
                {SUBTHEME_INFO[activeSubtheme]?.en}
              </p>
              <p style={{ fontFamily: "'Tropikal','Playfair Display',serif", fontSize: 'clamp(0.8rem,1.7vw,0.92rem)', fontStyle: 'italic', color: themeColors[activeSubtheme].text, lineHeight: 1.65, opacity: 0.78 }}>
                "{SUBTHEME_INFO[activeSubtheme]?.fil}"
              </p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Subtheme Section ── */}
      <section style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        padding: '0 0 clamp(2rem,5vw,4rem)',
        background: 'linear-gradient(180deg, #071810 0%, #0A140D 100%)',
        overflow: 'visible'
      }}>
        {/* Top Organic Separator - Soft Blend (KEPT - blends from previous section) */}
        <div style={{ position: 'absolute', top: -78, left: 0, width: '100%', height: 80, zIndex: 1, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="topWaveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0A140D" stopOpacity="1" />
                <stop offset="100%" stopColor="#0A140D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 80 Q360 20 720 60 Q1080 100 1440 50 L1440 80 L0 80 Z" fill="url(#topWaveGrad)" />
          </svg>
        </div>

        {/*
          ═══════════════════════════════════════════════════════════
          REMOVED: The bottom organic separator that was creating
          the visible cream/white cut-off in your first screenshot.
          The landscape's internal bottom-blend handles the transition
          to whatever section comes next.
          ═══════════════════════════════════════════════════════════
        */}

        {/*
          ═══════════════════════════════════════════════════════════
          REMOVED: The entire header block (✦ LEAP 2026 ✦ / Mga
          Subtheme / I-click ang isang subtheme...). It is now baked
          INTO SubthemeLandscape.tsx so the title and landscape are
          a single seamless composition with no division between them.
          ═══════════════════════════════════════════════════════════
        */}

        {/* ── Subtheme Interactive Landscape (Full Bleed, contains header) ── */}
        <SubthemeLandscape setActiveSubtheme={setActiveSubtheme} themeColors={themeColors} />

        {/* ── View Classes CTA (Centered Container) ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', marginTop: 'clamp(1rem,3vw,2rem)', position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <span style={{ flex: '0 1 80px', height: 1, background: 'linear-gradient(90deg,transparent,rgba(250,225,133,0.3))' }} />
            <svg viewBox="0 0 36 14" width="36" height="14" style={{ opacity: 0.7 }}>
              <ellipse cx="18" cy="7" rx="6" ry="2" fill="none" stroke="#fae185" strokeWidth="1" />
              <circle cx="18" cy="7" r="1.8" fill="#fae185" />
              <line x1="2" y1="7" x2="10" y2="7" stroke="#fae185" strokeWidth="0.8" opacity="0.6" />
              <line x1="26" y1="7" x2="34" y2="7" stroke="#fae185" strokeWidth="0.8" opacity="0.6" />
            </svg>
            <span style={{ flex: '0 1 80px', height: 1, background: 'linear-gradient(90deg,rgba(250,225,133,0.3),transparent)' }} />
          </div>

          <m.button
            onClick={onScrollToClasses}
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', margin: '0 auto', padding: '0.5rem 1.5rem' }}
          >
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(0.68rem,1.2vw,0.8rem)', fontWeight: 800, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(250,225,133,0.9)', textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
              View Classes
            </span>
            <ArrowDown size={22} strokeWidth={2} style={{ color: 'rgba(250,225,133,0.82)', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
          </m.button>
        </div>
      </section>
    </>
  );
};


/* ══════════════════════════════════════════════════════
  SPINNING GLOW RING
══════════════════════════════════════════════════════ */
const GlowRing = () => (
  <div style={{
    position: 'absolute',
    inset: -3,
    borderRadius: 31,
    background: 'conic-gradient(from 0deg, #fae185, #de9a49, #c07830, #de9a49, #fae185)',
    animation: 'spinRing 4s linear infinite',
    zIndex: -1,
    opacity: 0.7,
    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
    mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
  }} />
);

const NayonBanner = () => (
  <div
    style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #132015 0%, #1a3520 40%, #1e4028 70%, #1a3820 100%)',
      overflow: 'hidden',
      padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem)',
    }}
  >
    {/* Ambient radial glows */}
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '140%', background: 'radial-gradient(ellipse at center, rgba(222,154,73,0.12) 0%, rgba(222,154,73,0.04) 40%, transparent 70%)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', left: '15%', top: '40%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(74,176,100,0.08) 0%, transparent 65%)', filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', right: '12%', top: '35%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(222,154,73,0.1) 0%, transparent 65%)', filter: 'blur(18px)' }} />
    </div>

    {/* Palay stalks — left */}
    <svg viewBox="0 0 180 320" width="180" height="320"
      style={{ position: 'absolute', left: 0, bottom: 0, opacity: 0.22, pointerEvents: 'none', zIndex: 1 }}
      preserveAspectRatio="xMinYMax meet">
      {[
        { x: 20, lean: -8, h: 220 }, { x: 45, lean: 5, h: 260 }, { x: 70, lean: -4, h: 240 },
        { x: 95, lean: 8, h: 280 }, { x: 118, lean: -6, h: 250 }, { x: 142, lean: 4, h: 230 },
      ].map((s, i) => (
        <g key={i}>
          <path d={`M${s.x} 320 Q${s.x + s.lean * 0.5} ${320 - s.h * 0.5} ${s.x + s.lean} ${320 - s.h}`}
            stroke="#4a8a28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {[0, 0.22, 0.44, 0.66, 0.82, 1].map((t, gi) => {
            const py = 320 - s.h * t;
            const px = s.x + s.lean * t;
            const side = gi % 2 === 0 ? -1 : 1;
            return <ellipse key={gi} cx={px + side * 5} cy={py - 2} rx="4" ry="7" fill="#de9a49" opacity="0.8"
              transform={`rotate(${side * -22 + s.lean * 0.5}, ${px + side * 5}, ${py - 2})`} />;
          })}
        </g>
      ))}
    </svg>

    {/* Palay stalks — right (mirrored) */}
    <svg viewBox="0 0 180 320" width="180" height="320"
      style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.22, pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}
      preserveAspectRatio="xMinYMax meet">
      {[
        { x: 20, lean: -8, h: 220 }, { x: 45, lean: 5, h: 260 }, { x: 70, lean: -4, h: 240 },
        { x: 95, lean: 8, h: 280 }, { x: 118, lean: -6, h: 250 }, { x: 142, lean: 4, h: 230 },
      ].map((s, i) => (
        <g key={i}>
          <path d={`M${s.x} 320 Q${s.x + s.lean * 0.5} ${320 - s.h * 0.5} ${s.x + s.lean} ${320 - s.h}`}
            stroke="#4a8a28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {[0, 0.22, 0.44, 0.66, 0.82, 1].map((t, gi) => {
            const py = 320 - s.h * t;
            const px = s.x + s.lean * t;
            const side = gi % 2 === 0 ? -1 : 1;
            return <ellipse key={gi} cx={px + side * 5} cy={py - 2} rx="4" ry="7" fill="#de9a49" opacity="0.8"
              transform={`rotate(${side * -22 + s.lean * 0.5}, ${px + side * 5}, ${py - 2})`} />;
          })}
        </g>
      ))}
    </svg>

    {/* Top gold divider line */}
    <svg viewBox="0 0 1440 32" preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 32, pointerEvents: 'none', zIndex: 2 }}>
      <defs>
        <linearGradient id="nb-divG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(222,154,73,0)" />
          <stop offset="25%" stopColor="rgba(250,225,133,0.55)" />
          <stop offset="50%" stopColor="rgba(255,235,150,0.85)" />
          <stop offset="75%" stopColor="rgba(250,225,133,0.55)" />
          <stop offset="100%" stopColor="rgba(222,154,73,0)" />
        </linearGradient>
      </defs>
      <path d="M0 16 C200 8 400 22 720 14 C1040 6 1240 20 1440 12" stroke="url(#nb-divG)" strokeWidth="1.2" fill="none" />
      <path d="M0 20 C200 13 400 26 720 18 C1040 10 1240 24 1440 16" stroke="url(#nb-divG)" strokeWidth="0.6" fill="none" opacity="0.5" />
      {[144, 360, 576, 720, 864, 1080, 1296].map((x, i) => (
        <circle key={i} cx={x} cy={14 + (i % 2) * 4} r="1.8" fill="rgba(250,225,133,0.7)" />
      ))}
    </svg>

    {/* Main content */}
    <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>

      {/* Filipino sun */}
      <svg viewBox="0 0 60 60" width="48" height="48" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.7 }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const inner = 14, outer = i % 3 === 0 ? 26 : 21;
          return <line key={i} x1={30 + Math.cos(rad) * inner} y1={30 + Math.sin(rad) * inner}
            x2={30 + Math.cos(rad) * outer} y2={30 + Math.sin(rad) * outer}
            stroke="#fae185" strokeWidth={i % 3 === 0 ? 1.8 : 1.2} strokeLinecap="round" />;
        })}
        <circle cx="30" cy="30" r="11" fill="none" stroke="#fae185" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="5.5" fill="rgba(250,225,133,0.35)" />
      </svg>

      {/* Ornamental rule */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ flex: '0 1 120px', height: 1, background: 'linear-gradient(90deg, transparent, rgba(250,225,133,0.6))' }} />
        <svg viewBox="0 0 24 24" width="16" height="16" style={{ opacity: 0.7 }}>
          <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 20.5 L12 16 L6.5 20.5 L8.5 13.5 L3 9 L10 9 Z" fill="#fae185" />
        </svg>
        <span style={{ flex: '0 1 120px', height: 1, background: 'linear-gradient(90deg, rgba(250,225,133,0.6), transparent)' }} />
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(250,225,133,0.65)', marginBottom: '1rem' }}>
        ✦ Mga Klase · LEAP 2026 ✦
      </p>

      <h2 style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: 'clamp(1.6rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#fff8e0', lineHeight: 1.15, margin: '0 0 1rem', letterSpacing: '0.01em', textShadow: '0 2px 0 rgba(60,30,5,0.5), 0 4px 28px rgba(0,0,0,0.6), 0 0 48px rgba(222,154,73,0.3)' }}>
        Piliin ang iyong landas.<br />
        <span style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: '0.9em', fontWeight: 700, color: '#fae185', textShadow: 'none' }}>
          Palawakin ang iyong mundo.
        </span>
      </h2>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.82rem, 1.8vw, 1rem)', fontWeight: 400, color: 'rgba(249,236,182,0.7)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 1.75rem', fontStyle: 'italic' }}>
        "Choose your path. Expand your world." — Browse the classes below and register for the ones that call to you.
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap' }}>
        {[{ num: '200+', label: 'Classes' }, { num: '6', label: 'Subthemes' }, { num: '3', label: 'Days' }].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
            {i > 0 && <div style={{ position: 'absolute', left: 'calc(-1.5rem - 0.5px)', top: '15%', bottom: '15%', width: 1, background: 'rgba(250,225,133,0.2)' }} />}
            <p style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, color: '#fae185', lineHeight: 1, textShadow: '0 0 24px rgba(250,225,133,0.4)', marginBottom: '0.25rem' }}>{stat.num}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,236,182,0.55)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom ornamental rule */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.75rem' }}>
        <span style={{ flex: '0 1 100px', height: 1, background: 'linear-gradient(90deg, transparent, rgba(250,225,133,0.4))' }} />
        <svg viewBox="0 0 14 14" width="10" height="10" style={{ opacity: 0.5 }}>
          <circle cx="7" cy="7" r="3" fill="rgba(250,225,133,0.8)" />
        </svg>
        <span style={{ flex: '0 1 100px', height: 1, background: 'linear-gradient(90deg, rgba(250,225,133,0.4), transparent)' }} />
      </div>
    </div>

    {/* Floating lanterns */}
    {[
      { x: '8%', bottom: '20%', size: 18, dur: 14, delay: 0 },
      { x: '22%', bottom: '10%', size: 14, dur: 16, delay: 3 },
      { x: '78%', bottom: '15%', size: 16, dur: 15, delay: 1.5 },
      { x: '92%', bottom: '22%', size: 13, dur: 17, delay: 4 },
    ].map((p, i) => (
      <div key={i} style={{ position: 'absolute', left: p.x, bottom: p.bottom, zIndex: 3, pointerEvents: 'none', animation: `parolRise ${p.dur}s linear infinite`, animationDelay: `${p.delay}s` }}>
        <div style={{ width: p.size, height: p.size * 1.2, borderRadius: '40%', background: 'radial-gradient(circle at 50% 40%, #ffd980 0%, #de9a49 65%, #a05820 100%)', boxShadow: `0 0 ${p.size}px 4px rgba(255,200,100,0.5)` }} />
        <div style={{ width: 2, height: p.size * 0.25, background: 'rgba(100,50,20,0.5)', margin: '0 auto' }} />
      </div>
    ))}
  </div>
);
/* ══════════════════════════════════════════════════════
  MAIN EVENTS — carousel style
══════════════════════════════════════════════════════ */
const MainEventsSection = ({ onEventSelect }: { onEventSelect?: (item: any) => void }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchMainEvents = async () => {
      if (!contentfulClient) return;
      try {
        const response = await contentfulClient.getEntries({ content_type: 'mainEvents', include: 2, limit: 5 });
        if (response.items.length > 0) {
          const eventList = response.items.map((item: any) => {
            const pubMat = item.fields.mainEventPosterPublishingMaterial;
            const mediaAsset = Array.isArray(pubMat) ? pubMat[0] : pubMat;
            let imgUrl = `https://placehold.co/812x510?text=No+Image+Found`;
            if (mediaAsset?.fields?.file?.url) {
              const rawUrl = mediaAsset.fields.file.url.startsWith('http')
                ? mediaAsset.fields.file.url
                : `https:${mediaAsset.fields.file.url}`;
              imgUrl = optimizeContentfulImage(rawUrl, { width: 800 });
            }
            let formattedDate = '', formattedTime = '';
            if (item.fields.mainEventStartDate) {
              const startObj = new Date(item.fields.mainEventStartDate);
              formattedDate = startObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              formattedTime = startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              if (item.fields.mainEventEndDate) {
                const endObj = new Date(item.fields.mainEventEndDate);
                const endDateStr = endObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                if (formattedDate === endDateStr) {
                  formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                } else {
                  formattedDate += ` to ${endDateStr}`;
                  formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                }
              }
            }
            const orgLogoMat = item.fields.mainEventOrganizationInChargeLogo;
            const orgLogoAsset = Array.isArray(orgLogoMat) ? orgLogoMat[0] : orgLogoMat;
            return {
              id: item.sys.id,
              label: item.fields.mainEventTitle || 'Untitled Event',
              image: imgUrl,
              org: item.fields.mainEventOrganizationInCharge || '',
              modality: item.fields.mainEventClassModality || 'Face-to-Face',
              date: formattedDate,
              time: formattedTime,
              venue: item.fields.mainEventVenue || '',
              slots: item.fields.mainEventNumberOfSlots || 0,
              subtheme: item.fields.mainEventSubtheme || '',
              orgLogo: orgLogoAsset?.fields?.file?.url
              ? optimizeContentfulImage(`https:${orgLogoAsset.fields.file.url}`, { width: 64 })
              : null,
              googleFormUrl: item.fields.mainEventRegistrationLink || '',
              description: item.fields.mainEventDescription || ''
            };
          });
          if (eventList.length === 2) {
            eventList.push({ ...eventList[0], id: `${eventList[0].id}-dup1` });
            eventList.push({ ...eventList[1], id: `${eventList[1].id}-dup1` });
          }
          setEvents(eventList);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Contentful Error (Main Events):", error);
      }
    };

    fetchMainEvents();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => { if (!intervalId) intervalId = setInterval(fetchMainEvents, 60000); };
    const stopPolling = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    startPolling();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') { fetchMainEvents(); startPolling(); }
      else { stopPolling(); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); stopPolling(); };
  }, []);

  const goTo = (idx: number) => {
    setActiveIndex(idx);
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActiveIndex((c) => (c + 1) % events.length), 4500);
  };
  const goPrev = () => goTo((activeIndex - 1 + events.length) % events.length);
  const goNext = () => goTo((activeIndex + 1) % events.length);

  useEffect(() => {
    if (events.length <= 1) return;
    autoRef.current = setInterval(() => setActiveIndex((c) => (c + 1) % events.length), 4500);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [events.length]);

  const totalEvents = events.length;

  if (totalEvents === 0) {
    return (
      <section style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="leap-spinner" />
      </section>
    );
  }

  const visibleIndexes = totalEvents === 1
    ? [0]
    : [(activeIndex - 1 + totalEvents) % totalEvents, activeIndex, (activeIndex + 1) % totalEvents];

  return (
    <section style={{ position: 'relative', overflow: 'visible', padding: '0.25rem 0 0.25rem', background: 'transparent' }}>
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1500, margin: '0 auto', padding: '0 clamp(0.5rem, 2vw, 1rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
          {visibleIndexes.map((eventIndex, slot) => {
            const event = events[eventIndex];
            const isCenter = totalEvents === 1 ? true : slot === 1;
            const isLeft = slot === 0;

            return (
              <m.div
                key={`${event.id}-slot${slot}`}
                onClick={() => goTo(eventIndex)}
                initial={false}
                animate={{
                  scale: isCenter ? 1 : 0.84,
                  y: isCenter ? 0 : 24,
                  opacity: isCenter ? 1 : 0.78,
                  zIndex: isCenter ? 3 : 1,
                  filter: isCenter ? 'brightness(1) saturate(1)' : 'brightness(0.75) saturate(0.65)',
                  rotate: isCenter ? 0 : isLeft ? -3.5 : 3.5,
                }}
                transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: isCenter ? 'clamp(310px, 43vw, 800px)' : 'clamp(200px, 28vw, 560px)',
                  height: isCenter ? 'clamp(250px, 34vw, 440px)' : 'clamp(190px, 26vw, 360px)',
                  borderRadius: 28,
                  overflow: 'hidden',
                  border: isCenter ? '2px solid rgba(222,154,73,0.7)' : '1px solid rgba(249,236,182,0.12)',
                  boxShadow: isCenter ? '0 0 0 1px rgba(222,154,73,0.2), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(222,154,73,0.15)' : '0 8px 24px rgba(0,0,0,0.4)',
                  background: '#0a1408',
                  position: 'relative',
                  flexShrink: 0,
                  marginLeft: slot === 0 ? 0 : slot === 1 ? 'clamp(-3rem, -4vw, -2rem)' : 'clamp(-3rem, -4vw, -2rem)',
                  cursor: isCenter ? 'default' : 'pointer',
                  transformOrigin: isLeft ? 'right center' : 'left center',
                }}
              >
                {isCenter && <GlowRing />}

                <img
                  src={event.image}
                  alt={event.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  referrerPolicy="no-referrer"
                />

                <div style={{
                  position: 'absolute', inset: 0,
                  background: isCenter
                    ? 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.52) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.3) 100%)',
                }} />

                {isCenter && event.org && (
                  <>
                    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, gap: '0.4rem', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
                        {event.orgLogo ? (
                          <img src={event.orgLogo} alt={event.org}
                            style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.65)', boxShadow: '0 0 12px rgba(222,154,73,0.3)' }}
                            referrerPolicy="no-referrer" />
                        ) : (
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(222,154,73,0.22)', border: '1.5px solid rgba(222,154,73,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#de9a49', boxShadow: '0 0 10px rgba(222,154,73,0.25)' }}>
                            {event.org.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {event.subtheme && (
                          <m.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.22, duration: 0.32 }}
                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(20,30,25,0.92)', color: '#ffeaa3', padding: '0.2rem 0.55rem', borderRadius: 4, backdropFilter: 'blur(12px)', border: '1px solid rgba(250,225,133,0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', textShadow: '0 1px 4px rgba(0,0,0,0.6)', maxWidth: 'clamp(80px, 22vw, 160px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                            {event.subtheme}
                          </m.span>
                        )}
                      </div>
                      <m.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22, duration: 0.32 }}
                        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', background: 'rgba(0,0,0,0.72)', color: '#fae185', padding: '0.2rem 0.5rem', borderRadius: 4, backdropFilter: 'blur(10px)', border: '1px solid rgba(250,225,133,0.15)', boxShadow: '0 0 8px rgba(250,225,133,0.12)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {event.slots} SLOTS
                      </m.div>
                    </div>

                    <m.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1rem, 2.5vw, 1.75rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                    >
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fae185', marginBottom: '0.28rem', opacity: 0.88 }}>
                        {event.org}
                      </p>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1rem, 2vw, 1.7rem)', fontWeight: 800, color: '#fff', lineHeight: 1.08, marginBottom: '0.5rem', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
                        {event.label}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(249,236,182,0.84)', fontSize: '0.68rem', fontFamily: "'DM Sans',sans-serif" }}>
                          <Calendar size={10} style={{ color: '#fae185', flexShrink: 0 }} />
                          <span>{event.date} · {event.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(249,236,182,0.84)', fontSize: '0.68rem', fontFamily: "'DM Sans',sans-serif" }}>
                          <MapPin size={10} style={{ color: '#fae185', flexShrink: 0 }} />
                          <span>{event.venue} ({event.modality})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <a href={event.googleFormUrl || '#'} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ background: 'linear-gradient(135deg,#fae185,#de9a49,#c07830)', color: '#1a1008', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(222,154,73,0.45)', transition: 'filter .2s, transform .15s' }}>
                          Register <ExternalLink size={11} />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEventSelect) {
                              onEventSelect({ ...event, title: event.label });
                            }
                          }}
                          style={{ background: 'rgba(15,10,4,0.65)', border: '1px solid rgba(250,225,133,0.45)', color: '#fae185', borderRadius: 8, padding: '0.5rem 1.1rem', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
                        >
                          Learn More <ChevronRight size={11} />
                        </button>
                      </div>
                    </m.div>
                  </>
                )}
              </m.div>
            );
          })}
        </div>

        {totalEvents > 1 && (
          <div style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.9rem' }}>
            <button type="button" aria-label="Previous" onClick={goPrev}
              style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(222,154,73,0.45)', background: 'rgba(8,5,2,0.82)', color: '#fae185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(12px)', boxShadow: '0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(222,154,73,0.15)' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {events.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Event ${index + 1}`}
                  onClick={() => goTo(index)}
                  style={{
                    height: 44,
                    width: index === activeIndex ? 50 : 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span style={{
                    display: 'block',
                    height: 9,
                    width: index === activeIndex ? 34 : 9,
                    borderRadius: 999,
                    background: index === activeIndex ? '#fae185' : 'rgba(249,236,182,0.32)',
                    transition: 'all 0.32s ease',
                    boxShadow: index === activeIndex ? '0 0 12px rgba(250,225,133,0.7)' : 'none'
                  }} />
                </button>
              ))}
            </div>
            <button type="button" aria-label="Next" onClick={goNext}
              style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(222,154,73,0.45)', background: 'rgba(8,5,2,0.82)', color: '#fae185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(12px)', boxShadow: '0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(222,154,73,0.15)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};



const LeapApp = () => {
  interface LeapClass {
    id: string; title: string; org: string; modality: string; date: string;
    time: string; venue: string; slots: number; subtheme: string; image: string;
    orgLogo: string | null; googleFormUrl: string; description: string;
  }
  interface UserProfile {
    uid: string; email: string | null; displayName: string | null;
    photoURL: string | null; role: 'student' | 'admin'; registeredClasses: string[]; savedClasses: string[];
  }

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<LeapClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'major-events' | 'classes' | 'faq' | 'contact' | 'saved-classes'>('home');
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc'>('title-asc');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingClass, setViewingClass] = useState<LeapClass | null>(null);
  const [savedClassIds, setSavedClassIds] = useState<Set<string>>(new Set());
  const hasLoggedProfilePermissionIssue = useRef(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => setAuthError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const navigateTo = (view: 'home' | 'about' | 'major-events' | 'classes' | 'saved-classes' | 'faq' | 'contact') => {
    setCurrentView(view); setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToClassesSection = () => {
    const section = document.getElementById('classes-section');
    if (!section) return;
    const NAV_OFFSET = 104;
    const top = section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const filteredAndSortedClasses: LeapClass[] = useMemo(() => {
    let result = classes.filter((c) => (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtheme.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    result.sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'slots-desc') return b.slots - a.slots;
      if (sortBy === 'slots-asc') return a.slots - b.slots;
      return 0;
    });
    return result;
  }, [classes, searchQuery, sortBy]);

  const uniqueDays: string[] = useMemo(() => (
    Array.from(new Set(filteredAndSortedClasses.map((c) => c.date)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  ), [filteredAndSortedClasses]);

  const isVerifiedDlsuUser = Boolean(user?.emailVerified && user.email?.toLowerCase().endsWith('@dlsu.edu.ph'));
  const hasAppAccess = isVerifiedDlsuUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      void (async () => {
        try {
          setUser(currentUser);
          if (currentUser) {
            const currentEmail = currentUser.email?.toLowerCase();
            if (!currentUser.emailVerified || !currentEmail?.endsWith('@dlsu.edu.ph')) {
              setUserProfile(null); setIsAdminView(false); navigateTo('home');
              await signOut(auth);
              return;
            }
            try {
              const { doc, getDocFromServer, setDoc } = await import('firebase/firestore');
              const { getDb } = await import('./services/firebase-lazy');
              const db = await getDb();
              const userDoc = await getDocFromServer(doc(db, 'users', currentUser.uid));
              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
              } else {
                const newProfile: UserProfile = { uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL, role: 'student', registeredClasses: [], savedClasses: [] };
                await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                setUserProfile(newProfile);
              }
            } catch (error: unknown) {
              const isPermissionDenied = typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'permission-denied';
              if (isPermissionDenied) { if (!hasLoggedProfilePermissionIssue.current) { console.warn('Firestore profile access denied.'); hasLoggedProfilePermissionIssue.current = true; } }
              else { console.error('Firestore profile bootstrap failed:', error); }
              setUserProfile({ uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL, role: 'student', registeredClasses: [], savedClasses: [] });
            }
          } else { setUserProfile(null); setIsAdminView(false); setCurrentView('home'); }
        } catch (error: unknown) { console.error('Auth state handling failed:', error); setUserProfile(null); }
        finally { setLoading(false); }
      })();
    });
    return () => unsubscribe();
  }, []);

  // Load saved classes when user profile changes
  useEffect(() => {
    if (userProfile?.savedClasses) {
      setSavedClassIds(new Set(userProfile.savedClasses));
    } else {
      setSavedClassIds(new Set());
    }
  }, [userProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileOpen]);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      if (!contentfulClient) { setLoading(false); return; }
      try {
        const response = await contentfulClient.getEntries({ content_type: 'leapClass2026' });
        const classList: LeapClass[] = response.items.map((item: any) => {
          let formattedDate = '', formattedTime = '';
          if (item.fields.startDate) {
            const startObj = new Date(item.fields.startDate);
            formattedDate = startObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            formattedTime = startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            if (item.fields.endDate) {
              const endObj = new Date(item.fields.endDate);
              const endDateStr = endObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              if (formattedDate === endDateStr) { formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; }
              else { formattedDate += ` to ${endDateStr}`; formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; }
            }
          }
          return {
            id: item.sys.id, title: item.fields.title || '', org: item.fields.organizationInCharge || '',
            modality: item.fields.classModality || 'Face-to-Face', date: formattedDate, time: formattedTime,
            venue: item.fields.venue || '', slots: item.fields.numberOfSlots || 0, subtheme: item.fields.subtheme || '',
            image: item.fields.posterPublishingMaterial?.fields?.file?.url
            ? optimizeContentfulImage(`https:${item.fields.posterPublishingMaterial.fields.file.url}`, { width: 300 })
            : 'https://picsum.photos/seed/leap/400/250',
            orgLogo: item.fields.organizationInChargeLogo?.fields?.file?.url
            ? optimizeContentfulImage(`https:${item.fields.organizationInChargeLogo.fields.file.url}`, { width: 64 })
            : null,
            googleFormUrl: item.fields.registrationLink || '',
            description: item.fields.description || 'No description provided for this class.'
          };
        });
        setClasses(classList);
      } catch (error) { console.error("Contentful Error (Classes):", error); }
      finally { setLoading(false); }
    };
    fetchClasses();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => { if (!intervalId) intervalId = setInterval(fetchClasses, 60000); };
    const stopPolling = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    startPolling();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') { fetchClasses(); startPolling(); } else { stopPolling(); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); stopPolling(); };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 460);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!viewingClass) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [viewingClass]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (!result.user.emailVerified || !email?.endsWith('@dlsu.edu.ph')) {
        await signOut(auth);
        setAuthError('Access Denied: Please use your verified official @dlsu.edu.ph email to sign in.');
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError('An error occurred during sign in. Please try again.');
        console.error("Sign In Error:", error);
      }
    }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setIsMenuOpen(false); }
    catch (error) { console.error("Sign Out Error:", error); }
  };

  const toggleSaveClass = async (classId: string) => {
    if (!user || !userProfile) {
      console.warn('User or profile not loaded');
      return;
    }
    const isSaved = savedClassIds.has(classId);
    const newSavedIds = new Set(savedClassIds);
    if (isSaved) {
      newSavedIds.delete(classId);
    } else {
      newSavedIds.add(classId);
    }
    setSavedClassIds(newSavedIds);

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { getDb } = await import('./services/firebase-lazy');
      const db = await getDb();
      const updatedProfile = { ...userProfile, savedClasses: Array.from(newSavedIds) };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      console.log('Class saved successfully:', classId);
    } catch (error) {
      console.error('Error saving class:', error);
      setSavedClassIds(savedClassIds);
    }
  };

  const renderClassCard = (item: LeapClass, index: number) => (
    <ClassCard
      item={item}
      index={index}
      isLoggedIn={!!user}
      isSaved={savedClassIds.has(item.id)}
      onToggleSave={toggleSaveClass}
      onLearnMore={setViewingClass}
    />
  );

  const AdminDashboard = () => (
    <div className={styles.adminWrapper}>
      <div className={styles.adminHeader}>
        <button onClick={() => setIsAdminView(false)} className={styles.adminBackBtn}><ArrowLeft size={24} /></button>
        <h2 className={styles.adminTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h2>
      </div>
      <div className={styles.adminCard}>
        <div className={styles.adminIconWrap} style={{ width: 80, height: 80 }}><Edit size={36} /></div>
        <h3 className={styles.adminCardTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Classes are managed in Contentful</h3>
        <p className={styles.adminCardDesc}>To add, edit, or delete classes, please use the Contentful CMS dashboard.</p>
        <a href="https://app.contentful.com" target="_blank" rel="noopener noreferrer" className={styles.adminCTABtn}>Open Contentful <ExternalLink size={20} /></a>
      </div>
    </div>
  );

  const Contact = () => (
    <div style={{ padding: '9rem 1.5rem 4rem', background: 'linear-gradient(180deg, #fdf7e8 0%, #f0e5c8 100%)', minHeight: '70vh' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.72)', borderRadius: 28, padding: '2rem', border: '1px solid rgba(128,62,47,0.22)', boxShadow: '0 16px 48px rgba(51,75,70,0.08)' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#803e2f', marginBottom: '0.75rem' }}>Support</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#334b46', marginBottom: '1rem' }}>Contact the LEAP team</h2>
          <p style={{ color: '#567069', fontSize: '1rem', lineHeight: 1.7, maxWidth: 680, marginBottom: '1.5rem' }}>Reach out for registration help, class concerns, or general questions.</p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '1.1rem 1.2rem', border: '1px solid rgba(128,62,47,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Mail size={18} color="#803e2f" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#334b46' }}>Email</h3>
              </div>
              <p style={{ margin: 0, color: '#567069' }}>leap@dlsu.edu.ph</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: '1.1rem 1.2rem', border: '1px solid rgba(128,62,47,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={18} color="#803e2f" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#334b46' }}>Response Time</h3>
              </div>
              <p style={{ margin: 0, color: '#567069' }}>Within 1-2 business days</p>
            </div>
          </div>
          <a href="mailto:leap@dlsu.edu.ph" className={styles.navRegisterBtn} style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Mail size={16} /> Send Email
          </a>
        </div>
      </div>
    </div>
  );

  if (isAdminView && userProfile?.role === 'admin') {
    return <ErrorBoundary><AdminDashboard /></ErrorBoundary>;
  }



  const HeroSection = (
    <header className={styles.heroSection} style={{
      background: 'linear-gradient(180deg, #1a2940 0%, #1d3148 8%, #1f3a4c 18%, #234048 28%, #284240 38%, #2c4338 48%, #2e4632 58%, #314830 68%, #344932 78%, #3a4a35 86%, #4a4a3a 94%, #5a4838 100%)',
    }}>
      <div className={styles.heroBackdropContainer}>
        <div className={styles.heroBackdropTop} />
        <div className={styles.heroBackdropRight} />
      </div>

      {/* Filipino River */}
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '32%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="hrRiverG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a6080" stopOpacity="0.92" />
            <stop offset="30%" stopColor="#1e4a68" stopOpacity="0.98" />
            <stop offset="70%" stopColor="#163850" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f2638" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="hrGlassG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(160,210,240,0)" />
            <stop offset="25%" stopColor="rgba(160,210,240,0.18)" />
            <stop offset="50%" stopColor="rgba(255,230,160,0.32)" />
            <stop offset="75%" stopColor="rgba(160,210,240,0.18)" />
            <stop offset="100%" stopColor="rgba(160,210,240,0)" />
          </linearGradient>
          <radialGradient id="hrMoonReflG" cx="50%" cy="0%" r="60%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="rgba(255,225,140,0.55)" />
            <stop offset="40%" stopColor="rgba(255,210,100,0.18)" />
            <stop offset="100%" stopColor="rgba(255,210,100,0)" />
          </radialGradient>
          <linearGradient id="hrBankTopG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#214848" stopOpacity="0" />
            <stop offset="40%" stopColor="#1e4030" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a3a20" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="hrRippleG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(200,230,255,0)" />
            <stop offset="35%" stopColor="rgba(200,230,255,0.45)" />
            <stop offset="65%" stopColor="rgba(255,235,170,0.35)" />
            <stop offset="100%" stopColor="rgba(200,230,255,0)" />
          </linearGradient>
          <radialGradient id="hrLilyG" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#4a8c3a" />
            <stop offset="100%" stopColor="#2a5c22" />
          </radialGradient>
          <filter id="hrGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hrBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <path
          d="M0 42 Q80 28 180 38 Q280 48 380 32 Q460 20 560 36 Q660 52 760 34 Q860 18 960 38 Q1060 56 1160 36 Q1260 18 1360 40 Q1400 46 1440 38 L1440 0 L0 0 Z"
          fill="url(#hrBankTopG)"
        />
        {[30, 90, 160, 250, 340, 430, 520, 610, 700, 790, 880, 970, 1060, 1150, 1240, 1330, 1400].map((x, i) => {
          const bankY = i % 3 === 0 ? 36 : i % 3 === 1 ? 32 : 40;
          return (
            <g key={i} transform={`translate(${x}, ${bankY})`} opacity="0.7">
              <path d={`M0 0 Q-2 -7 -1 -13`} stroke="#3a7030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d={`M0 0 Q2 -5 4 -10`} stroke="#2e6028" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d={`M0 0 Q-4 -4 -6 -8`} stroke="#4a8038" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        {[18, 28, 38, 48, 58].map((x, i) => (
          <g key={i} transform={`translate(${x}, 40)`}>
            <line x1="0" y1="0" x2={-2 + i} y2={-32 - i * 4} stroke="#3a6828" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx={-2 + i} cy={-32 - i * 4} rx="4" ry="2.5" fill="#4a8830" opacity="0.8" transform={`rotate(${-15 + i * 8}, ${-2 + i}, ${-32 - i * 4})`} />
          </g>
        ))}
        {[1380, 1390, 1400, 1410, 1420].map((x, i) => (
          <g key={i} transform={`translate(${x}, 38)`}>
            <line x1="0" y1="0" x2={2 - i} y2={-28 - i * 3} stroke="#3a6828" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx={2 - i} cy={-28 - i * 3} rx="3.5" ry="2" fill="#4a8830" opacity="0.75" transform={`rotate(${12 - i * 6}, ${2 - i}, ${-28 - i * 3})`} />
          </g>
        ))}

        <path
          d="M0 42 Q80 28 180 38 Q280 48 380 32 Q460 20 560 36 Q660 52 760 34 Q860 18 960 38 Q1060 56 1160 36 Q1260 18 1360 40 Q1400 46 1440 38 L1440 180 Q1080 190 720 185 Q360 180 0 188 Z"
          fill="url(#hrRiverG)"
        />

        <ellipse cx="720" cy="100" rx="200" ry="55" fill="url(#hrMoonReflG)" filter="url(#hrBlur)" />
        <ellipse cx="720" cy="80" rx="80" ry="18" fill="rgba(255,225,140,0.22)" filter="url(#hrBlur)" />
        <rect x="0" y="55" width="1440" height="30" fill="url(#hrGlassG)" opacity="0.7" />

        {[62, 80, 100, 120, 145, 165].map((y, i) => (
          <path
            key={i}
            d={`M0 ${y} Q240 ${y - 5} 480 ${y} T960 ${y} T1440 ${y}`}
            stroke="url(#hrRippleG)"
            strokeWidth={0.8 + (i % 3) * 0.4}
            fill="none"
            opacity={0.5 - i * 0.06}
            className={`ripple-drift ripple-d${i % 4}`}
          />
        ))}

        {[
          { x: 140, y: 115, r: 11, rot: 20 },
          { x: 160, y: 122, r: 8, rot: -10 },
          { x: 380, y: 108, r: 13, rot: 35 },
          { x: 600, y: 130, r: 10, rot: -20 },
          { x: 820, y: 112, r: 12, rot: 15 },
          { x: 1050, y: 125, r: 9, rot: -30 },
          { x: 1280, y: 118, r: 11, rot: 25 },
          { x: 1310, y: 130, r: 7, rot: -8 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}>
            <ellipse rx={p.r} ry={p.r * 0.55} fill="url(#hrLilyG)" opacity="0.82" />
            <path d={`M0 0 L${p.r * 0.6} ${-p.r * 0.3}`} stroke="#2a5c22" strokeWidth="0.8" fill="none" opacity="0.6" />
            {i % 3 === 0 && (
              <circle cx={p.r * 0.1} cy={-p.r * 0.15} r="2.5" fill="#e88898" opacity="0.8" />
            )}
          </g>
        ))}

        {[
          { x: 200, y: 95, rx: 18, ry: 40, color: 'rgba(255,180,60,0.18)' },
          { x: 560, y: 88, rx: 14, ry: 32, color: 'rgba(255,200,80,0.14)' },
          { x: 900, y: 98, rx: 16, ry: 36, color: 'rgba(255,180,60,0.16)' },
          { x: 1240, y: 92, rx: 12, ry: 28, color: 'rgba(255,200,80,0.12)' },
        ].map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry}
            fill={l.color} filter="url(#hrBlur)"
            style={{ animation: `sunReflect ${3.5 + i * 0.7}s ease-in-out infinite` }}
          />
        ))}

        {[180, 420, 680, 950, 1200].map((x, i) => (
          <circle key={i} cx={x} cy={72 + (i % 3) * 12} r="2"
            fill="#fae185" opacity="0.6"
            filter="url(#hrGlow)"
            style={{ animation: `parolPulse ${2.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
          />
        ))}

        <path
          d="M0 188 Q360 180 720 185 Q1080 190 1440 180 L1440 220 L0 220 Z"
          fill="#334b46"
          opacity="1"
        />
        <path
          d="M0 188 Q360 180 720 185 Q1080 190 1440 180 L1440 200 Q1080 206 720 202 Q360 198 0 204 Z"
          fill="#2a4a28"
          opacity="0.6"
        />
        {[50, 130, 220, 320, 420, 530, 640, 750, 860, 970, 1070, 1170, 1280, 1370].map((x, i) => (
          <g key={i} transform={`translate(${x}, 186)`} opacity="0.55">
            <path d={`M0 0 Q-1 -5 -2 -9`} stroke="#4a7830" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d={`M0 0 Q2 -4 3 -7`} stroke="#3a6828" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <style>{`
          @keyframes parolPulse {
            0%, 100% { opacity: 0.4; transform: scale(0.85); }
            50%       { opacity: 0.9; transform: scale(1.15); }
          }
        `}</style>

      {/* Atmospheric Layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '55%',
          background: 'radial-gradient(ellipse at center, rgba(255,235,170,0.14) 0%, rgba(200,180,120,0.06) 35%, rgba(180,160,100,0.02) 60%, transparent 80%)',
          filter: 'blur(8px)',
        }} />
        <div className="atm-cloud-far" style={{
          position: 'absolute', top: '22%', left: '-10%', width: '120%', height: '20%',
          background: 'radial-gradient(ellipse 30% 60% at 18% 50%, rgba(220,235,210,0.22) 0%, transparent 70%), radial-gradient(ellipse 25% 55% at 75% 40%, rgba(200,220,205,0.18) 0%, transparent 70%), radial-gradient(ellipse 28% 60% at 50% 60%, rgba(210,225,200,0.14) 0%, transparent 70%)',
          filter: 'blur(18px)',
        }} />
        <div className="atm-cloud-mid" style={{
          position: 'absolute', top: '36%', left: '-8%', width: '116%', height: '18%',
          background: 'radial-gradient(ellipse 22% 55% at 28% 50%, rgba(200,220,205,0.18) 0%, transparent 75%), radial-gradient(ellipse 26% 60% at 68% 45%, rgba(190,215,200,0.16) 0%, transparent 75%)',
          filter: 'blur(14px)',
        }} />
        <div className="atm-cloud-near" style={{
          position: 'absolute', top: '48%', left: '-6%', width: '112%', height: '16%',
          background: 'radial-gradient(ellipse 18% 50% at 12% 50%, rgba(180,210,200,0.14) 0%, transparent 75%), radial-gradient(ellipse 20% 50% at 88% 50%, rgba(180,210,200,0.14) 0%, transparent 75%), radial-gradient(ellipse 16% 45% at 50% 50%, rgba(180,210,200,0.10) 0%, transparent 75%)',
          filter: 'blur(10px)',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: 0, right: 0, height: '12%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(150,180,170,0.18) 50%, transparent 100%)',
          filter: 'blur(6px)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: 0, width: '14%', height: '70%',
          background: 'radial-gradient(ellipse 60% 45% at 0% 30%, rgba(20,55,35,0.55) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 0% 65%, rgba(15,45,28,0.5) 0%, transparent 75%), radial-gradient(ellipse 50% 35% at 0% 90%, rgba(25,60,38,0.4) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: 0, width: '14%', height: '70%',
          background: 'radial-gradient(ellipse 60% 45% at 100% 30%, rgba(20,55,35,0.55) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 100% 65%, rgba(15,45,28,0.5) 0%, transparent 75%), radial-gradient(ellipse 50% 35% at 100% 90%, rgba(25,60,38,0.4) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(8,16,12,0.35) 100%)',
          pointerEvents: 'none',
        }} />
        <style>{`
            @keyframes atmCloudFar  { 0%{transform:translateX(-2%)} 100%{transform:translateX(2%)} }
            @keyframes atmCloudMid  { 0%{transform:translateX(2%)}  100%{transform:translateX(-2%)} }
            @keyframes atmCloudNear { 0%{transform:translateX(-1.5%)} 100%{transform:translateX(1.5%)} }
            .atm-cloud-far  { animation: atmCloudFar  52s ease-in-out infinite alternate; }
            .atm-cloud-mid  { animation: atmCloudMid  38s ease-in-out infinite alternate; }
            .atm-cloud-near { animation: atmCloudNear 28s ease-in-out infinite alternate; }
          `}</style>
      </div>

      <Suspense fallback={null}>
        <NayonScene />
      </Suspense>
      <Fireflies />

      <div className={styles.heroContent}>
        <m.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <img src={leapLogo} alt="LEAP 2026 — Isang Nayon, Isang Layunin" width="280" height="158" className={styles.heroLogo} loading="eager" fetchPriority="high" style={{ aspectRatio: '280 / 158' }} />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <AnimatedTagline />

          {!user && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', width: '100%' }}
            >
              <button
                onClick={handleSignIn}
                className="btn-leap-primary"
                style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1rem',
                  borderRadius: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(222,154,73,0.25)',
                  cursor: 'pointer'
                }}
              >
                <LogIn size={20} /> Sign In
              </button>
            </m.div>
          )}
        </m.div>
      </div>

      {hasAppAccess && currentView === 'home' && (
        <ScrollInvitation onClick={scrollToClassesSection} />
      )}
    </header>
  );

  const HeroExtras = hasAppAccess && currentView === 'home' ? (
    <>
      {/* Magsasaka-swirl transition */}
      <div style={{ position: 'relative', lineHeight: 0, marginTop: '0px', overflow: 'hidden', zIndex: 20 }}>
        <svg viewBox="0 0 1440 170" preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: 'clamp(120px, 14vw, 180px)', display: 'block', position: 'relative', marginTop: '-30px' }}>
          <defs>
            <linearGradient id="msBaseG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334b46" stopOpacity="1" />
              <stop offset="40%" stopColor="#2a4038" stopOpacity="1" />
              <stop offset="75%" stopColor="#1a2e26" stopOpacity="1" />
              <stop offset="100%" stopColor="#0d1f1c" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="msSwirlG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(222,154,73,0)" />
              <stop offset="20%" stopColor="rgba(222,154,73,0.4)" />
              <stop offset="50%" stopColor="rgba(250,225,133,0.7)" />
              <stop offset="80%" stopColor="rgba(222,154,73,0.4)" />
              <stop offset="100%" stopColor="rgba(222,154,73,0)" />
            </linearGradient>
            <linearGradient id="msSwirlSoftG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(180,140,80,0)" />
              <stop offset="50%" stopColor="rgba(200,160,90,0.35)" />
              <stop offset="100%" stopColor="rgba(180,140,80,0)" />
            </linearGradient>
            <radialGradient id="msPalayHaloG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(222,154,73,0.22)" />
              <stop offset="100%" stopColor="rgba(222,154,73,0)" />
            </radialGradient>
            <linearGradient id="msStemG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5a8030" />
              <stop offset="100%" stopColor="#2a4a18" />
            </linearGradient>
            <filter id="msGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="1440" height="140" y="30" fill="url(#msBaseG)" />
          <path d="M0,0 L0,42 C200,30 400,52 600,38 C800,24 1000,48 1200,34 C1340,26 1410,40 1440,38 L1440,0 Z"
            fill="#334b46" opacity="1" />
          <path d="M0,0 L0,32 C220,22 420,42 620,28 C820,16 1020,38 1220,24 C1360,18 1420,30 1440,28 L1440,0 Z"
            fill="#3a5450" opacity="1" />
          <path d="M0,22 C160,12 320,30 540,18 C760,6 960,28 1180,14 C1340,4 1420,20 1440,18 L1440,22 Z"
            fill="#2c4438" opacity="0.7" />

          <ellipse cx="320" cy="60" rx="240" ry="40" fill="url(#msPalayHaloG)" />
          <ellipse cx="1100" cy="55" rx="220" ry="38" fill="url(#msPalayHaloG)" />
          <ellipse cx="720" cy="80" rx="200" ry="36" fill="url(#msPalayHaloG)" opacity="0.7" />

          <path d="M-60 70 C200 30 380 95 580 55 C780 18 980 88 1180 50 C1340 22 1440 65 1500 50"
            stroke="url(#msSwirlG)" strokeWidth="2.5" fill="none" opacity="0.85" filter="url(#msGlow)" />
          <path d="M-60 85 C180 50 360 105 560 70 C760 38 960 100 1160 65 C1320 40 1440 78 1500 65"
            stroke="url(#msSwirlSoftG)" strokeWidth="1.8" fill="none" opacity="0.65" />
          <path d="M-60 100 C220 70 420 120 620 88 C820 58 1020 115 1220 82 C1380 58 1440 92 1500 82"
            stroke="url(#msSwirlSoftG)" strokeWidth="1.2" fill="none" opacity="0.45" />

          {[
            { x: 180, y: 50, r: 14, rot: 25 },
            { x: 460, y: 72, r: 11, rot: -15 },
            { x: 720, y: 58, r: 16, rot: 35 },
            { x: 980, y: 75, r: 12, rot: -22 },
            { x: 1240, y: 56, r: 14, rot: 18 },
          ].map((s, i) => (
            <g key={i} transform={`translate(${s.x}, ${s.y}) rotate(${s.rot})`} opacity="0.55">
              <path d={`M0 0 Q${s.r * 0.5} ${-s.r * 0.3} ${s.r} 0 Q${s.r * 0.5} ${s.r * 0.4} 0 ${s.r * 0.2} Q${-s.r * 0.3} 0 0 0`}
                fill="none" stroke="rgba(250,225,133,0.55)" strokeWidth="1" strokeLinecap="round" />
              <path d={`M${-s.r * 0.3} ${s.r * 0.1} Q${-s.r * 0.7} ${-s.r * 0.2} ${-s.r} ${-s.r * 0.1}`}
                fill="none" stroke="rgba(222,154,73,0.5)" strokeWidth="0.9" strokeLinecap="round" />
            </g>
          ))}

          {[
            { x: 100, y: 78, h: 26 }, { x: 280, y: 92, h: 30 }, { x: 420, y: 85, h: 24 },
            { x: 580, y: 95, h: 28 }, { x: 720, y: 85, h: 32 }, { x: 860, y: 92, h: 26 },
            { x: 1020, y: 88, h: 30 }, { x: 1180, y: 90, h: 24 }, { x: 1340, y: 82, h: 28 },
          ].map((p, i) => {
            const lean = ((i % 3) - 1) * 3;
            const grainY = [0, 5, 10, 15];
            return (
              <g key={i} transform={`translate(${p.x}, ${p.y - p.h})`} opacity="0.7">
                <path d={`M0 ${p.h} Q${lean} ${p.h / 2} ${lean * 0.6} 0`}
                  stroke="url(#msStemG)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                {grainY.map((gy, gi) => (
                  <ellipse key={gi}
                    cx={lean * (gy / p.h) + (gi % 2 === 0 ? -2.5 : 2.5)}
                    cy={gy}
                    rx="2.4" ry="4.2"
                    fill="#de9a49" opacity="0.85"
                    transform={`rotate(${-18 + (gi % 2) * 36}, ${lean * (gy / p.h) + (gi % 2 === 0 ? -2.5 : 2.5)}, ${gy})`}
                  />
                ))}
                <ellipse cx={lean * 0.6} cy="-1" rx="1.2" ry="2" fill="rgba(255,235,170,0.7)" />
              </g>
            );
          })}

          <g transform="translate(720, 65)" opacity="0.32">
            <circle r="22" fill="none" stroke="rgba(222,154,73,0.7)" strokeWidth="1" />
            <circle r="15" fill="none" stroke="rgba(250,225,133,0.5)" strokeWidth="0.7" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
              const rad = ang * Math.PI / 180;
              return (
                <g key={i} transform={`translate(${Math.cos(rad) * 18}, ${Math.sin(rad) * 18}) rotate(${ang + 90})`}>
                  <ellipse rx="3.5" ry="1.6" fill="rgba(250,225,133,0.7)" />
                  <ellipse rx="1.8" ry="0.8" fill="rgba(255,245,200,0.85)" />
                </g>
              );
            })}
            <circle r="3.5" fill="rgba(255,235,150,0.7)" />
          </g>

          {[80, 220, 360, 500, 640, 780, 920, 1060, 1200, 1340].map((x, i) => {
            const yWave = 70 + Math.sin(i * 0.8) * 20;
            return (
              <g key={i} transform={`translate(${x}, ${yWave})`}>
                <circle r="1.6" fill="#fae185" opacity="0.7" filter="url(#msGlow)" />
                {i % 2 === 0 && (
                  <>
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="rgba(250,225,133,0.4)" strokeWidth="0.5" />
                    <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(250,225,133,0.4)" strokeWidth="0.5" />
                  </>
                )}
              </g>
            );
          })}

          <path d="M0,138 C200,122 400,154 600,135 C800,116 1000,150 1200,130 C1340,116 1420,138 1440,140 L1440,170 L0,170 Z"
            fill="#0d1f1c" opacity="0.6" />
          <path d="M0,148 C220,132 440,162 640,144 C840,126 1040,156 1240,138 C1380,126 1430,146 1440,148 L1440,170 L0,170 Z"
            fill="#0d1f1c" />
        </svg>
      </div>

      <LazySection minHeight={700}>
      <TheAwakening />
      </LazySection>
      <LazySection minHeight={500}>
      {/* Main Events Section */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #c89848 0%, #d4a855 8%, #c8a060 18%, #b89058 30%, #2a3d28 58%, #1a2e1e 75%, #132018 100%)',
        paddingTop: '0.25rem',
        paddingBottom: '4rem',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(180deg, #c89848 0%, rgba(200,152,72,0) 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 60, pointerEvents: 'none', zIndex: 1, opacity: 0.5 }}>
          <defs>
            <linearGradient id="sandShimG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,220,140,0)" />
              <stop offset="50%" stopColor="rgba(255,220,140,0.35)" />
              <stop offset="100%" stopColor="rgba(255,220,140,0)" />
            </linearGradient>
          </defs>
          {[8, 18, 28, 40, 52].map((y, i) => (
            <path key={i} d={`M0 ${y} Q360 ${y - 3} 720 ${y} T1440 ${y}`}
              stroke="url(#sandShimG)" strokeWidth="0.8" fill="none" opacity={0.6 - i * 0.1} />
          ))}
        </svg>

        {/* Banderitas */}
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
          style={{ position: 'absolute', top: 30, left: 0, width: '100%', height: 80, pointerEvents: 'none', zIndex: 1, opacity: 0.85 }}>
          <defs>
            <linearGradient id="banderitaStringG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(80,40,10,0)" />
              <stop offset="20%" stopColor="rgba(120,70,30,0.6)" />
              <stop offset="50%" stopColor="rgba(100,55,20,0.7)" />
              <stop offset="80%" stopColor="rgba(120,70,30,0.6)" />
              <stop offset="100%" stopColor="rgba(80,40,10,0)" />
            </linearGradient>
          </defs>
          <path d="M-20 8 Q360 48 720 38 Q1080 28 1460 8"
            stroke="url(#banderitaStringG)" strokeWidth="1.2" fill="none" />
          {[
            { x: 60, c: '#8a2818' }, { x: 130, c: '#c87830' }, { x: 200, c: '#d4a838' },
            { x: 270, c: '#5a8030' }, { x: 340, c: '#3a5a90' }, { x: 410, c: '#8a2858' },
            { x: 480, c: '#c87830' }, { x: 550, c: '#d4a838' }, { x: 620, c: '#5a8030' },
            { x: 700, c: '#3a5a90' }, { x: 780, c: '#8a2818' }, { x: 860, c: '#c87830' },
            { x: 930, c: '#d4a838' }, { x: 1000, c: '#5a8030' }, { x: 1070, c: '#3a5a90' },
            { x: 1140, c: '#8a2858' }, { x: 1210, c: '#c87830' }, { x: 1280, c: '#d4a838' },
            { x: 1350, c: '#5a8030' }, { x: 1420, c: '#3a5a90' },
          ].map((p, i) => {
            const t = p.x / 1440;
            const yString = 8 + Math.sin(t * Math.PI) * 32;
            return (
              <g key={i} className="banderita-sway" style={{ animationDelay: `${i * 0.1}s`, transformOrigin: `${p.x}px ${yString}px` }}>
                <path d={`M${p.x - 5} ${yString} L${p.x + 5} ${yString} L${p.x} ${yString + 14} Z`}
                  fill={p.c} opacity="0.85" stroke="rgba(40,15,5,0.3)" strokeWidth="0.5" />
              </g>
            );
          })}
          <style>{`
              @keyframes banderitaSway {
                0%, 100% { transform: rotate(-3deg); }
                50%      { transform: rotate(3deg); }
              }
              .banderita-sway { animation: banderitaSway 4s ease-in-out infinite; }
            `}</style>
        </svg>

        {/* Grand Editorial Header */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '1.25rem', position: 'relative', zIndex: 3, padding: '0 1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
            <span style={{ flex: '0 1 80px', height: 1, background: 'linear-gradient(90deg, transparent, rgba(80,40,10,0.5))' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.6rem, 0.78vw, 0.72rem)', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(60,30,5,0.85)', whiteSpace: 'nowrap' }}>
              ✦ Featured This Year ✦
            </span>
            <span style={{ flex: '0 1 80px', height: 1, background: 'linear-gradient(90deg, rgba(80,40,10,0.5), transparent)' }} />
          </div>
          <h2 style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 700, color: '#1a0e04', lineHeight: 1, margin: 0, letterSpacing: '0.01em', textShadow: '0 2px 0 rgba(255,235,170,0.4), 0 4px 18px rgba(120,70,20,0.45), 0 0 36px rgba(222,154,73,0.25)', position: 'relative', display: 'inline-block' }}>
            Main Events
          </h2>
          <svg viewBox="0 0 240 24" width="240" height="24" style={{ display: 'block', margin: '0.85rem auto 0', overflow: 'visible' }}>
            <defs>
              <linearGradient id="meHeaderUnderlineG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(120,70,20,0)" />
                <stop offset="20%" stopColor="rgba(140,85,30,0.85)" />
                <stop offset="50%" stopColor="rgba(70,35,8,1)" />
                <stop offset="80%" stopColor="rgba(140,85,30,0.85)" />
                <stop offset="100%" stopColor="rgba(120,70,20,0)" />
              </linearGradient>
            </defs>
            <g transform="translate(120,12)">
              <path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="rgba(80,40,10,0.85)" />
              <circle r="1.5" fill="rgba(40,20,5,0.95)" />
            </g>
            <path d="M10 12 Q40 12 70 12 Q90 12 100 12 Q108 12 112 12" stroke="url(#meHeaderUnderlineG)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M128 12 Q160 12 200 12 Q220 12 230 12" stroke="url(#meHeaderUnderlineG)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="6" cy="12" r="1.2" fill="rgba(80,40,10,0.7)" />
            <circle cx="234" cy="12" r="1.2" fill="rgba(80,40,10,0.7)" />
          </svg>

        </m.div>

        <div style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)',
          width: 'min(900px, 80vw)', height: 'clamp(280px, 40vw, 480px)', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,235,170,0.18) 0%, rgba(222,154,73,0.1) 35%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1,
          animation: 'stageGlowPulse 5s ease-in-out infinite',
        }} />
        <style>{`
            @keyframes stageGlowPulse {
              0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
              50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
            }
          `}</style>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <MainEventsSection onEventSelect={(item) => setViewingClass(item)} />
        </div>
      </div>
      </LazySection>

      <LazySection minHeight={400}>
      <NayonBanner />
      </LazySection>
      <LazySection minHeight={900}>
      {/* Subthemes */}
      <div style={{ background: 'linear-gradient(180deg, #1a3820 0%, #1a2e1e 100%)', position: 'relative' }}>
        <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden', marginTop: '-3px' }}>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="xMidYMid slice"
            style={{ width: '100%', height: 'clamp(60px, 10vw, 100px)', display: 'block', overflow: 'visible', background: 'transparent' }}>
            <rect width="1440" height="90" fill="#1a3820" />
            <defs>
              <linearGradient id="topGoldLineG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(222,154,73,0)" />
                <stop offset="15%" stopColor="rgba(222,154,73,0.5)" />
                <stop offset="35%" stopColor="rgba(250,225,133,0.85)" />
                <stop offset="50%" stopColor="rgba(255,235,170,1)" />
                <stop offset="65%" stopColor="rgba(250,225,133,0.85)" />
                <stop offset="85%" stopColor="rgba(222,154,73,0.5)" />
                <stop offset="100%" stopColor="rgba(222,154,73,0)" />
              </linearGradient>
              <linearGradient id="topGoldLineSoftG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,215,120,0)" />
                <stop offset="50%" stopColor="rgba(255,215,120,0.4)" />
                <stop offset="100%" stopColor="rgba(255,215,120,0)" />
              </linearGradient>
              <filter id="topGoldGlow" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="stemGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a6a22" />
                <stop offset="100%" stopColor="#2a4a18" />
              </linearGradient>
            </defs>
            <path d="M0,12 C200,5 400,20 600,10 C800,2 1000,18 1200,8 C1340,2 1410,14 1440,10"
              stroke="url(#topGoldLineSoftG)" strokeWidth="6" fill="none" opacity="0.6" filter="url(#topGoldGlow)" />
            <path d="M0,12 C200,5 400,20 600,10 C800,2 1000,18 1200,8 C1340,2 1410,14 1440,10"
              stroke="url(#topGoldLineG)" strokeWidth="1.5" fill="none" opacity="0.9" filter="url(#topGoldGlow)" />
            <path d="M0,12 C200,5 400,20 600,10 C800,2 1000,18 1200,8 C1340,2 1410,14 1440,10"
              stroke="url(#topGoldLineG)" strokeWidth="0.6" fill="none" opacity="1" />
            {[180, 380, 600, 820, 1040, 1260].map((x, i) => {
              const yWave = 8 + Math.sin(i * 1.2) * 5;
              return <circle key={`gold-${i}`} cx={x} cy={yWave} r="1.2" fill="#fae185" opacity="0.85" filter="url(#topGoldGlow)" />;
            })}
            {[40, 110, 190, 270, 340, 420, 510, 590, 670, 760, 840, 920, 1010, 1090, 1180, 1260, 1340, 1410].map((x, i) => {
              const h = 28 + (i % 4) * 6;
              const lean = ((i % 3) - 1) * 4;
              const grainY = [0, 5, 10, 15, 20];
              return (
                <g key={i} transform={`translate(${x}, ${55 - h})`} opacity="0.55">
                  <path d={`M0,${h} Q${lean},${h / 2} ${lean * 0.6},0`} stroke="url(#stemGradTop)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {grainY.map((gy, gi) => (
                    <ellipse key={gi} cx={lean * (gy / h) + (gi % 2 === 0 ? -3 : 3)} cy={gy} rx="2.8" ry="5"
                      fill="#de9a49" opacity="0.7" transform={`rotate(${-18 + (gi % 2) * 36}, ${lean * (gy / h) + (gi % 2 === 0 ? -3 : 3)}, ${gy})`} />
                  ))}
                </g>
              );
            })}
            {[120, 280, 450, 620, 790, 960, 1130, 1300].map((x, i) => (
              <circle key={i} cx={x} cy={i % 2 === 0 ? 44 : 50} r="1.5" fill="#fae185" opacity="0.45" />
            ))}
          </svg>
        </div>

        <SubthemeAboutSection onScrollToClasses={scrollToClassesSection} />


        <div style={{ position: 'relative', lineHeight: 0, marginTop: '-2px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 80, background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(222,154,73,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
          <svg viewBox="0 0 1440 90" preserveAspectRatio="xMidYMid slice"
            style={{ width: '100%', height: 'clamp(60px, 10vw, 100px)', display: 'block', position: 'relative', zIndex: 2 }}>
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a2e1e" stopOpacity="1" />
                <stop offset="100%" stopColor="#fffdf6" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a6a22" />
                <stop offset="100%" stopColor="#2a4a18" />
              </linearGradient>
            </defs>
            <path d="M0,20 C180,50 360,10 540,30 C720,50 900,15 1080,35 C1260,55 1380,25 1440,38 L1440,90 L0,90 Z" fill="#132015" opacity="0.7" />
            {[40, 110, 190, 270, 340, 420, 510, 590, 670, 760, 840, 920, 1010, 1090, 1180, 1260, 1340, 1410].map((x, i) => {
              const h = 28 + (i % 4) * 6;
              const lean = ((i % 3) - 1) * 4;
              const grainY = [0, 5, 10, 15, 20];
              return (
                <g key={i} transform={`translate(${x}, ${55 - h})`} opacity="0.55">
                  <path d={`M0,${h} Q${lean},${h / 2} ${lean * 0.6},0`} stroke="url(#stemGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {grainY.map((gy, gi) => (
                    <ellipse key={gi} cx={lean * (gy / h) + (gi % 2 === 0 ? -3 : 3)} cy={gy} rx="2.8" ry="5"
                      fill="#de9a49" opacity="0.7" transform={`rotate(${-18 + (gi % 2) * 36}, ${lean * (gy / h) + (gi % 2 === 0 ? -3 : 3)}, ${gy})`} />
                  ))}
                </g>
              );
            })}
            <path d="M0,35 C200,15 400,55 600,35 C800,15 1000,50 1200,30 C1320,18 1400,40 1440,45 L1440,90 L0,90 Z" fill="#1d2e1a" opacity="0.5" />
            <path d="M0,48 C160,28 320,62 520,45 C720,28 880,58 1080,42 C1240,30 1360,52 1440,56 L1440,90 L0,90 Z" fill="url(#waveGrad1)" />
            <path d="M0,48 C160,28 320,62 520,45 C720,28 880,58 1080,42 C1240,30 1360,52 1440,56" stroke="rgba(222,154,73,0.28)" strokeWidth="1" fill="none" />
            {[120, 280, 450, 620, 790, 960, 1130, 1300].map((x, i) => (
              <circle key={i} cx={x} cy={i % 2 === 0 ? 44 : 50} r="1.5" fill="#fae185" opacity="0.45" />
            ))}
          </svg>
        </div>
      </div>
      </LazySection>
    </>
  ) : null;

  if (!hasAppAccess) {
    return (
      <div className={styles.appContainer}>
        <AnimatePresence>
          {authError && (
            <m.div
              initial={{ opacity: 0, y: -40, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              style={{ position: 'fixed', top: '1.5rem', left: '50%', zIndex: 9999, background: '#803e2f', color: '#fae185', padding: '0.85rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 12px 32px rgba(128, 62, 47, 0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600, maxWidth: '90vw', border: '1px solid rgba(249, 236, 182, 0.2)' }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
              <button onClick={() => setAuthError(null)} style={{ background: 'transparent', border: 'none', color: '#fae185', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: '0.5rem' }}>
                <X size={16} />
              </button>
            </m.div>
          )}
        </AnimatePresence>
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 py-5`}
          style={{ background: 'linear-gradient(180deg, rgba(26,41,64,0.98) 0%, rgba(29,49,72,0.82) 40%, rgba(31,58,76,0.4) 72%, rgba(35,64,72,0) 100%)', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}>
          <div className={styles.navInner}>
            <div className={styles.navLogo} onClick={() => window.scrollTo(0, 0)}>
              <img src={leapLogo} alt="LEAP 2026" width="74" height="42" className={styles.navLogoImg} style={{ mixBlendMode: 'screen' }} />
            </div>
            <div />
          </div>
        </nav>
        <main>
          {HeroSection}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Navbar
        isLoggedIn={!!user}
        user={user}
        userProfile={userProfile}
        currentView={currentView}
        scrolled={scrolled}
        isMenuOpen={isMenuOpen}
        authError={authError}
        onMenuToggle={setIsMenuOpen}
        onSearchClick={() => setIsSearchModalOpen(true)}
        onNavigate={navigateTo as (view: string) => void}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onAdminClick={() => setIsAdminView(true)}
        logoImg={leapLogo}
      />

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(8,10,8,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setIsSearchModalOpen(false)}>
            <m.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2001, background: '#fdf7e8', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1rem', maxHeight: '85vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#3a2a10', margin: 0 }}>Search & Filter</h2>
                <button onClick={() => setIsSearchModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c6040' }}><X size={24} /></button>
              </div>

              {/* Search Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Search classes by name, org..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: 12,
                    border: '1.5px solid rgba(222,154,73,0.3)',
                    background: 'rgba(255,253,245,0.95)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.95rem',
                    color: '#3a2a10',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Sort Options */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#de9a49', marginBottom: '0.5rem' }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 10,
                    border: '1.5px solid rgba(222,154,73,0.3)',
                    background: 'rgba(255,253,245,0.95)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.9rem',
                    color: '#3a2a10',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="slots-desc">Most Slots</option>
                  <option value="slots-asc">Least Slots</option>
                </select>
              </div>

              {/* Close Button */}
              <button onClick={() => setIsSearchModalOpen(false)} style={{ width: '100%', padding: '0.95rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #fae185 0%, #de9a49 55%, #c07830 100%)', color: '#1a1008', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Apply & Close</button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
      {loading ? (
      <div className={styles.loadingContainer} style={{ flex: 1, minHeight: '100vh' }}>
        <div className={styles.loadingContent}>
          <div className="leap-spinner" />
          <p className={styles.loadingText}>Loading LEAP 2026…</p>
        </div>
      </div>
    ) : (
      <>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0', minHeight: '100vh' }}><div className="leap-spinner" /></div>}>
          {currentView === 'home' && (
            <Home
              user={user} classes={classes}
              filteredAndSortedClasses={filteredAndSortedClasses} uniqueDays={uniqueDays}
              selectedDay={selectedDay} onDaySelect={(d) => { setSelectedDay(d); setCurrentPage(1); }}
              viewingClass={viewingClass} onClassSelect={(c) => { setViewingClass(c) }}
              onSignIn={handleSignIn} onHeroScroll={() => navigateTo('classes')}
              HeroSection={HeroSection} HeroExtras={HeroExtras} renderClassCard={renderClassCard}
            />
          )}
          {currentView === 'about' && <About />}
          {currentView === 'major-events' && <MainEvents />}
          {currentView === 'classes' && (
            <Classes
              user={user} searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
              sortBy={sortBy} onSortChange={(s) => setSortBy(s)}
              filteredAndSortedClasses={filteredAndSortedClasses} uniqueDays={uniqueDays}
              selectedDay={selectedDay} onDaySelect={(d) => { setSelectedDay(d); setCurrentPage(1); }}
              currentPage={currentPage} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              viewingClass={viewingClass} onClassSelect={(c) => { setViewingClass(c) }}
              onSignIn={handleSignIn} renderClassCard={renderClassCard}
            />
          )}
          {currentView === 'saved-classes' && (
            <SavedClasses
              filteredAndSortedClasses={filteredAndSortedClasses}
              savedClassIds={savedClassIds}
              renderClassCard={renderClassCard}
            />
          )}
          {currentView === 'faq' && <FAQs />}
          {currentView === 'contact' && <Contact />}
        </Suspense>

        <Footer logoImg={leapLogo} onNavigate={navigateTo as (view: string) => void} />
      </>
    )}

      <AnimatePresence>
        {showBackToTop && !viewingClass && (
          <m.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={styles.backToTopBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
          >
            <ChevronUp size={14} />
            Top
          </m.button>
        )}
      </AnimatePresence>

      <ScrollProgress />
    </div>
  );
};

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <ErrorBoundary>
        <LeapApp />
      </ErrorBoundary>
    </LazyMotion>
  );
}
