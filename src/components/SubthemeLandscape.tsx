import { m } from 'framer-motion';
import { useState, useEffect } from 'react';
import { THEME_ILLUSTRATIONS } from './shared/theme-illustrations';

interface SubthemeLandscapeProps {
  themes: Array<{ name: string; imageUrl?: string | null }>;
  setActiveSubtheme: (label: string) => void;
  themeColors: Record<string, { glow: string; border: string; text: string }>;
}

const LandscapeLabel = ({ label, color, glow }: { label: string; color: string; glow: string }) => {
  const parts = label.split(' ng ');
  return (
    <div style={{ textAlign: 'center', position: 'relative', zIndex: 3, marginTop: '0.4rem', pointerEvents: 'none' }}>
      <p style={{ fontFamily: "'Tropikal','Playfair Display',serif", fontSize: '0.95rem', fontWeight: 700, color: '#fff8e0', margin: '0 0 0.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.95)', letterSpacing: '0.03em', lineHeight: 1.2 }}>{parts[0]}</p>
      {parts[1] && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.55rem', fontWeight: 800, color, margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase', textShadow: `0 0 8px ${glow}` }}>ng {parts[1]}</p>}
    </div>
  );
};

const GlowAura = ({ color }: { color: string }) => (
  <div style={{ position: 'absolute', inset: '-60px', borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: 0.6, pointerEvents: 'none', zIndex: 1 }} />
);

type PalayGrainsProps = { steps: number[]; h: number; lean: number; offset: number; rx: string; ry: string; opacity: number; rotBase: number };
const PalayGrains = ({ steps, h, lean, offset, rx, ry, opacity, rotBase }: PalayGrainsProps) => (
  <>
    {steps.map((t, gi) => {
      const py = -h * t - 2;
      const px = lean * t;
      const side = gi % 2 === 0 ? -1 : 1;
      return (
        <ellipse key={gi} cx={px + side * offset} cy={py} rx={rx} ry={ry} fill="url(#palayG)" opacity={opacity} transform={`rotate(${side * rotBase + lean * 2}, ${px + side * offset}, ${py})`} />
      );
    })}
  </>
);

export const SubthemeLandscape = ({ themes, setActiveSubtheme, themeColors }: SubthemeLandscapeProps) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  const renderIllustration = (theme: { name: string; imageUrl?: string | null }) => {
    const illustration = THEME_ILLUSTRATIONS[theme.name];
    if (illustration) {
      return illustration;
    }
    return (
      <svg width="120" height="140" viewBox="0 0 120 140">
        <circle cx="60" cy="55" r="40" fill="rgba(250,225,133,0.15)" stroke="rgba(250,225,133,0.3)" strokeWidth="2" />
        <text x="60" y="62" textAnchor="middle" fill="rgba(250,225,133,0.6)" fontSize="28" fontFamily="'Tropikal',serif">{"✦"}</text>
        <path d="M40 100 Q60 90 80 100" stroke="rgba(250,225,133,0.2)" strokeWidth="1.5" fill="none" />
      </svg>
    );
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, width: '100%', overflow: 'visible' }}>
      <div style={{ position: 'relative', width: '100%', height: isMobile ? 1200 : 900, overflow: 'visible' }}>

        {/* TOP BLEND */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, #0A140D 0%, rgba(10,20,13,0) 100%)', zIndex: 12, pointerEvents: 'none' }} />

        {/* BOTTOM BLEND */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(180deg, rgba(10,20,13,0) 0%, rgba(10,20,13,0.5) 60%, #0A140D 100%)', zIndex: 12, pointerEvents: 'none' }} />

        {/* LEFT EDGE BLEND */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '14%', background: 'linear-gradient(90deg, #0A140D 0%, rgba(10,20,13,0.7) 25%, rgba(10,20,13,0) 100%)', zIndex: 12, pointerEvents: 'none' }} />

        {/* RIGHT EDGE BLEND */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '14%', background: 'linear-gradient(270deg, #0A140D 0%, rgba(10,20,13,0.7) 25%, rgba(10,20,13,0) 100%)', zIndex: 12, pointerEvents: 'none' }} />

        <svg
          width="100%"
          height="100%"
          viewBox={isMobile ? "0 0 1440 1200" : "0 0 1440 900"}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="lsSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0A140D" />
              <stop offset="25%" stopColor="#0B1A11" />
              <stop offset="55%" stopColor="#0d2014" />
              <stop offset="85%" stopColor="#102818" />
              <stop offset="100%" stopColor="#13301c" />
            </linearGradient>
            <linearGradient id="lsGround" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1a3a20" /><stop offset="100%" stopColor="#0A140D" /></linearGradient>
            <linearGradient id="lsGroundFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#205028" /><stop offset="100%" stopColor="#0d2010" /></linearGradient>
            <linearGradient id="lsHill1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#245630" /><stop offset="100%" stopColor="#152e1c" /></linearGradient>
            <linearGradient id="lsHill2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1e4a2c" /><stop offset="100%" stopColor="#12271a" /></linearGradient>
            <linearGradient id="lsHill3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#193825" /><stop offset="100%" stopColor="#0f2018" /></linearGradient>
            <linearGradient id="lsMtn" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#1a2e22" /><stop offset="100%" stopColor="#0d1e10" /></linearGradient>
            <linearGradient id="lsWater" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1a4a6a" stopOpacity="0.4" /><stop offset="50%" stopColor="#2a6a8a" stopOpacity="0.6" /><stop offset="100%" stopColor="#1a4a6a" stopOpacity="0.4" /></linearGradient>
            <radialGradient id="lsSunG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff4c4" /><stop offset="50%" stopColor="#de9a49" stopOpacity="0.5" /><stop offset="100%" stopColor="#de9a49" stopOpacity="0" /></radialGradient>
            <radialGradient id="lsHeaderGlow" cx="50%" cy="22%" r="45%">
              <stop offset="0%" stopColor="rgba(222,154,73,0.06)" />
              <stop offset="100%" stopColor="rgba(222,154,73,0)" />
            </radialGradient>
            <linearGradient id="lsMist" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0A140D" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#0A140D" stopOpacity="0" />
              <stop offset="80%" stopColor="#0A140D" stopOpacity="0" />
              <stop offset="100%" stopColor="#0A140D" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="palayG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8c860" />
              <stop offset="100%" stopColor="#a07820" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="1440" height={isMobile ? 1200 : 900} fill="url(#lsSky)" />
          <rect x="0" y="0" width="1440" height="500" fill="url(#lsHeaderGlow)" />
          <ellipse cx="720" cy="460" rx="600" ry="180" fill="url(#lsSunG)" opacity="0.18" />

          {/* Stars */}
          {[
            [120, 90], [340, 78], [580, 74], [820, 82], [1060, 76], [1300, 88],
            [200, 150], [460, 142], [700, 160], [940, 138], [1180, 154],
            [80, 210], [320, 230], [560, 200], [780, 240], [1010, 220], [1280, 195],
            [150, 290], [410, 310], [650, 280], [890, 320], [1120, 295], [1360, 285],
            [240, 380], [510, 360], [770, 395], [1020, 370], [1280, 385]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.4} fill="#fae185" opacity={0.15 + (i % 4) * 0.08}>
              <animate attributeName="opacity" values={`${0.15 + (i % 4) * 0.05};${0.4 + (i % 4) * 0.1};${0.15 + (i % 4) * 0.05}`} dur={`${3 + (i % 5) * 0.7}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Back mountains */}
          <path d="M200 620 L400 500 L600 620Z" fill="url(#lsMtn)" opacity="0.5" />
          <path d="M600 600 L800 470 L1000 600Z" fill="url(#lsMtn)" opacity="0.6" />
          <path d="M900 630 L1050 530 L1200 630Z" fill="url(#lsMtn)" opacity="0.4" />

          {/* Back hills */}
          <path d="M-1500 680 Q200 620 450 650 Q650 675 800 640 Q1000 605 1200 640 Q1350 660 2940 645 L2940 900 L-1500 900Z" fill="url(#lsHill3)" />

          {/* Mid hills */}
          <path d="M-1500 720 Q180 685 380 705 Q560 725 720 695 Q900 665 1100 700 Q1280 725 2940 705 L2940 900 L-1500 900Z" fill="url(#lsHill2)" />

          {/* River */}
          <path d="M-1500 738 Q360 728 720 740 Q1080 752 2940 738 L2940 765 Q1080 775 720 762 Q360 750 -1500 765Z" fill="url(#lsWater)" />
          {[100, 350, 600, 850, 1100, 1350].map((x, i) => (
            <path key={i} d={`M${x} 750 Q${x + 30} 748 ${x + 60} 750`} stroke="rgba(150,220,240,0.2)" strokeWidth="1.5" fill="none" />
          ))}

          {/* Front hill / ground */}
          <path d="M-1500 775 Q200 750 450 768 Q650 782 820 758 Q1020 734 1200 765 Q1360 786 2940 770 L2940 900 L-1500 900Z" fill="url(#lsHill1)" />
          <path d="M-1500 795 Q300 775 600 790 Q900 805 1200 785 Q1360 775 2940 788 L2940 900 L-1500 900Z" fill="url(#lsGround)" />

          {/* Mid-ground grass tufts */}
          {[60, 200, 340, 480, 620, 760, 900, 1040, 1180, 1320].map((x, i) => (
            <g key={i} transform={`translate(${x},${790 + (i % 3) * 5})`}>
              <path d="M0 0 Q-2 -10 0 -18" stroke="#2a7a30" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M0 0 Q3 -8 5 -14" stroke="#1e6025" strokeWidth="1.8" fill="none" opacity="0.5" />
            </g>
          ))}

          {/* Atmospheric mist overlay */}
          <rect x="-1500" y="0" width="4440" height={isMobile ? 1200 : 900} fill="url(#lsMist)" pointerEvents="none" />

          {/* Foreground rolling hill */}
          <path d={`M-1500 830 Q300 805 600 822 Q900 840 1200 815 Q1360 805 2940 820 L2940 ${isMobile ? 1200 : 900} L-1500 ${isMobile ? 1200 : 900}Z`} fill="url(#lsGroundFront)" opacity="0.95" />
          <path d="M-1500 830 Q300 805 600 822 Q900 840 1200 815 Q1360 805 2940 820" stroke="rgba(74,160,80,0.25)" strokeWidth="1.5" fill="none" />

          {/* Foreground palay stalks - row 1 */}
          {Array.from({ length: 28 }).map((_, i) => {
            const x = 30 + i * 52 + (i % 3) * 8;
            const baseY = 838 + (i % 4) * 4;
            const h = 26 + (i % 3) * 5;
            const lean = ((i % 2) === 0 ? -2 : 2) + (i % 5 - 2);
            return (
              <g key={`palay-back-${i}`} transform={`translate(${x}, ${baseY})`} opacity="0.78">
                <path d={`M0 0 Q${lean * 0.4} ${-h * 0.5} ${lean} ${-h}`} stroke="#3a6a22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <PalayGrains steps={[0, 0.25, 0.5, 0.75, 1]} h={h} lean={lean} offset={2.8} rx="2.2" ry="3.5" opacity={0.85} rotBase={-18} />
                <path d="M0 0 Q-4 -3 -7 -4" stroke="#2e5a1c" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
              </g>
            );
          })}

          {/* Foreground palay stalks - row 2 */}
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 50 + i * 66 + (i % 2) * 12;
            const baseY = 866 + (i % 3) * 5;
            const h = 32 + (i % 3) * 7;
            const lean = ((i % 2) === 0 ? -3 : 3) + (i % 4 - 1.5);
            return (
              <g key={`palay-front-${i}`} transform={`translate(${x}, ${baseY})`} opacity="0.92">
                <path d={`M0 0 Q${lean * 0.4} ${-h * 0.5} ${lean} ${-h}`} stroke="#3e7028" strokeWidth="1.7" fill="none" strokeLinecap="round" />
                <PalayGrains steps={[0, 0.2, 0.4, 0.6, 0.8, 1]} h={h} lean={lean} offset={3.2} rx="2.6" ry="4.2" opacity={0.95} rotBase={-20} />
                <ellipse cx={lean} cy={-h - 1} rx="1.4" ry="2" fill="rgba(255,235,160,0.85)" />
                <path d="M0 0 Q-5 -4 -9 -6" stroke="#326020" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
                <path d="M0 0 Q5 -3 8 -5" stroke="#326020" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
              </g>
            );
          })}

          <ellipse cx="720" cy="892" rx="900" ry="14" fill="rgba(222,154,73,0.06)" />
        </svg>

        {/* Header Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', zIndex: 11, pointerEvents: 'none', padding: 'clamp(3rem, 6vw, 5rem) 1.5rem 0' }}>
          <svg viewBox="0 0 600 300" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(700px,100%)', opacity: 0.05, pointerEvents: 'none' }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return <line key={i} x1="300" y1="150" x2={300 + Math.cos(angle) * 320} y2={150 + Math.sin(angle) * 320} stroke="#fae185" strokeWidth="1" />;
            })}
          </svg>
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.5rem,2vw,1.2rem)', marginBottom: '1.2rem' }}>
              <span style={{ flex: '0 1 clamp(40px,8vw,100px)', height: 1, background: 'linear-gradient(90deg,transparent,rgba(250,225,133,0.6))' }} />
              <svg viewBox="0 0 48 48" width="28" height="28" style={{ flexShrink: 0, opacity: 0.9 }}>
                <g transform="translate(24,24)">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang, i) => {
                    const r = (ang * Math.PI) / 180, inner = i % 3 === 0 ? 8 : 6, outer = i % 3 === 0 ? 20 : 15;
                    return <line key={i} x1={Math.cos(r) * inner} y1={Math.sin(r) * inner} x2={Math.cos(r) * outer} y2={Math.sin(r) * outer} stroke="#fae185" strokeWidth={i % 3 === 0 ? 1.8 : 1.1} strokeLinecap="round" />;
                  })}
                  <circle r="7" fill="none" stroke="#fae185" strokeWidth="1.2" />
                </g>
              </svg>
              <span style={{ flex: '0 1 clamp(40px,8vw,100px)', height: 1, background: 'linear-gradient(90deg,rgba(250,225,133,0.6),transparent)' }} />
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(0.55rem,1vw,0.65rem)', fontWeight: 800, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(250,225,133,0.65)', marginBottom: '0.75rem' }}>{"✦ LEAP 2026 ✦"}</p>
            <h2 style={{ fontFamily: "'Tropikal','Playfair Display',serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 700, color: '#fff8e0', margin: '0 0 0.75rem', lineHeight: 1.05, letterSpacing: '0.01em', textShadow: '0 2px 0 rgba(60,30,5,0.6), 0 4px 32px rgba(0,0,0,0.7), 0 0 64px rgba(222,154,73,0.35)' }}>
              Mga Subtheme
            </h2>
            <svg viewBox="0 0 280 20" width="220" height="16" style={{ display: 'block', margin: '0 auto 1rem' }}>
              <path d="M10 10 Q70 6 140 10 Q210 14 270 10" stroke="#fae185" strokeWidth="1.5" fill="none" opacity="0.6" />
              <circle cx="140" cy="10" r="2.5" fill="#fae185" />
            </svg>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(0.82rem,1.8vw,0.98rem)', color: 'rgba(249,236,182,0.72)', fontStyle: 'italic', margin: 0, lineHeight: 1.6, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              I-click ang isang subtheme para malaman ang impormasyon ukol dito.
            </p>
          </div>
        </div>

        {/* Interactive Elements Overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', overflow: 'visible', paddingTop: isMobile ? '240px' : '380px' }}>
          <div style={{
            position: 'relative',
            //width: '100%',
            //maxWidth: isMobile ? '500px' : '900px',
            padding: isMobile ? '1rem 0' : '0',
            gap: isMobile ? '0' : '1rem',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${themes.length}, 1fr)`,
            justifyItems: 'center',
            alignItems: 'start',
            pointerEvents: 'none',
          }}>
            {themes.map((theme) => {
              const c = themeColors[theme.name] ?? { glow: 'rgba(250,225,133,0.3)', border: 'rgba(250,225,133,0.5)', text: '#fae185' };
              return (
                <m.button
                  key={theme.name}
                  onClick={() => setActiveSubtheme(theme.name)}
                  whileHover={{ scale: 1.12, filter: 'brightness(1.3)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10,
                    padding: 0,
                    pointerEvents: 'auto',
                    //width: isMobile ? '100%' : '220px',
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GlowAura color={c.glow} />
                    <div style={{ position: 'relative', zIndex: 2 }}>{renderIllustration(theme)}</div>
                  </div>
                  <LandscapeLabel label={theme.name} color={c.text} glow={c.glow} />
                </m.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
