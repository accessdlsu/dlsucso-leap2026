import { motion } from 'framer-motion';
import { useState, useEffect, type ReactNode } from 'react';

interface SubthemeLandscapeProps {
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

export const SubthemeLandscape = ({ setActiveSubtheme, themeColors }: SubthemeLandscapeProps) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  const btn = (label: string, x: number, y: number, children: ReactNode) => {
    const c = themeColors[label];
    return (
      <motion.button
        key={label}
        onClick={() => setActiveSubtheme(label)}
        whileHover={{ scale: 1.12, filter: 'brightness(1.3)' }}
        whileTap={{ scale: 0.96 }}
        style={{ 
          position: isMobile ? 'relative' : 'absolute', 
          left: isMobile ? 'auto' : x, 
          top: isMobile ? 'auto' : y, 
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, padding: 0,
          width: isMobile ? '100%' : 'auto'
        }}
      >
        <div style={{ 
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
          transform: isMobile ? 'scale(0.85)' : 'none',
          transformOrigin: 'center bottom'
        }}>
          <GlowAura color={c.glow} />
          <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
        </div>
        <LandscapeLabel label={label} color={c.text} glow={c.glow} />
      </motion.button>
    );
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, width: '100%', overflow: 'visible' }}>
      {/* Background SVG - taller canvas, header sits inside the sky portion */}
      <div style={{ position: 'relative', width: '100%', height: isMobile ? 1200 : 900, overflow: 'visible' }}>

        {/* TOP BLEND - softens the very top edge into parent (only at the very top) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(180deg, #0A140D 0%, rgba(10,20,13,0) 100%)',
          zIndex: 12,
          pointerEvents: 'none',
        }} />

        {/* BOTTOM BLEND - dissolves ground into parent bg */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: 'linear-gradient(180deg, rgba(10,20,13,0) 0%, rgba(10,20,13,0.5) 60%, #0A140D 100%)',
          zIndex: 12,
          pointerEvents: 'none',
        }} />

        {/* LEFT EDGE BLEND */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '14%',
          background: 'linear-gradient(90deg, #0A140D 0%, rgba(10,20,13,0.7) 25%, rgba(10,20,13,0) 100%)',
          zIndex: 12,
          pointerEvents: 'none',
        }} />

        {/* RIGHT EDGE BLEND */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '14%',
          background: 'linear-gradient(270deg, #0A140D 0%, rgba(10,20,13,0.7) 25%, rgba(10,20,13,0) 100%)',
          zIndex: 12,
          pointerEvents: 'none',
        }} />

        <svg
          width="100%"
          height="100%"
          viewBox={isMobile ? "0 0 1440 1200" : "0 0 1440 900"}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            {/* Sky gradient - matches parent at top, deepens into night sky */}
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

            {/* Subtle haze around the header area */}
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

            {/* Palay grain gradient for foreground tufts */}
            <linearGradient id="palayG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8c860" />
              <stop offset="100%" stopColor="#a07820" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width="1440" height={isMobile ? 1200 : 900} fill="url(#lsSky)" />

          {/* Soft glow behind header text area */}
          <rect x="0" y="0" width="1440" height="500" fill="url(#lsHeaderGlow)" />

          {/* Sun glow - lower so it doesn't conflict with header */}
          <ellipse cx="720" cy="460" rx="600" ry="180" fill="url(#lsSunG)" opacity="0.18" />

          {/* Stars - distributed across upper sky */}
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

          {/* Back mountains - shifted down to live below header area */}
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

          {/* Mid-ground grass tufts (smaller, softer) */}
          {[60, 200, 340, 480, 620, 760, 900, 1040, 1180, 1320].map((x, i) => (
            <g key={i} transform={`translate(${x},${790 + (i % 3) * 5})`}>
              <path d="M0 0 Q-2 -10 0 -18" stroke="#2a7a30" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M0 0 Q3 -8 5 -14" stroke="#1e6025" strokeWidth="1.8" fill="none" opacity="0.5" />
            </g>
          ))}

          {/* Atmospheric mist overlay */}
          <rect x="-1500" y="0" width="4440" height={isMobile ? 1200 : 900} fill="url(#lsMist)" pointerEvents="none" />

          {/* ════════════════════════════════════════
              FOREGROUND PALAY TUFTS (the "frontest" layer)
          ════════════════════════════════════════ */}

          {/* Foreground rolling hill - below all interactive elements */}
          <path d={`M-1500 830 Q300 805 600 822 Q900 840 1200 815 Q1360 805 2940 820 L2940 ${isMobile ? 1200 : 900} L-1500 ${isMobile ? 1200 : 900}Z`} fill="url(#lsGroundFront)" opacity="0.95" />

          {/* Front field highlight stroke */}
          <path d="M-1500 830 Q300 805 600 822 Q900 840 1200 815 Q1360 805 2940 820"
            stroke="rgba(74,160,80,0.25)" strokeWidth="1.5" fill="none" />

          {/* Foreground palay stalks - row 1 (further back) */}
          {Array.from({ length: 28 }).map((_, i) => {
            const x = 30 + i * 52 + (i % 3) * 8;
            const baseY = 838 + (i % 4) * 4;
            const h = 26 + (i % 3) * 5;
            const lean = ((i % 2) === 0 ? -2 : 2) + (i % 5 - 2);
            return (
              <g key={`palay-back-${i}`} transform={`translate(${x}, ${baseY})`} opacity="0.78">
                <path d={`M0 0 Q${lean * 0.4} ${-h * 0.5} ${lean} ${-h}`}
                  stroke="#3a6a22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                {[0, 0.25, 0.5, 0.75, 1].map((t, gi) => {
                  const py = -h * t - 2;
                  const px = lean * t;
                  const side = gi % 2 === 0 ? -1 : 1;
                  return (
                    <ellipse key={gi}
                      cx={px + side * 2.8}
                      cy={py}
                      rx="2.2" ry="3.5"
                      fill="url(#palayG)"
                      opacity="0.85"
                      transform={`rotate(${side * -18 + lean * 2}, ${px + side * 2.8}, ${py})`}
                    />
                  );
                })}
                <path d={`M0 0 Q-4 -3 -7 -4`} stroke="#2e5a1c" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
              </g>
            );
          })}

          {/* Foreground palay stalks - row 2 (even more forward, larger) */}
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 50 + i * 66 + (i % 2) * 12;
            const baseY = 866 + (i % 3) * 5;
            const h = 32 + (i % 3) * 7;
            const lean = ((i % 2) === 0 ? -3 : 3) + (i % 4 - 1.5);
            return (
              <g key={`palay-front-${i}`} transform={`translate(${x}, ${baseY})`} opacity="0.92">
                <path d={`M0 0 Q${lean * 0.4} ${-h * 0.5} ${lean} ${-h}`}
                  stroke="#3e7028" strokeWidth="1.7" fill="none" strokeLinecap="round" />
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, gi) => {
                  const py = -h * t - 2;
                  const px = lean * t;
                  const side = gi % 2 === 0 ? -1 : 1;
                  return (
                    <ellipse key={gi}
                      cx={px + side * 3.2}
                      cy={py}
                      rx="2.6" ry="4.2"
                      fill="url(#palayG)"
                      opacity="0.95"
                      transform={`rotate(${side * -20 + lean * 2}, ${px + side * 3.2}, ${py})`}
                    />
                  );
                })}
                <ellipse cx={lean} cy={-h - 1} rx="1.4" ry="2" fill="rgba(255,235,160,0.85)" />
                <path d={`M0 0 Q-5 -4 -9 -6`} stroke="#326020" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
                <path d={`M0 0 Q5 -3 8 -5`} stroke="#326020" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
              </g>
            );
          })}

          {/* Subtle ground glow at base of palay rows */}
          <ellipse cx="720" cy="892" rx="900" ry="14" fill="rgba(222,154,73,0.06)" />

        </svg>

        {/* ═════════════════════════════════════════════
            HEADER OVERLAY - sits inside the sky portion
            of the SVG so the title and the landscape feel
            like a single composition
        ═════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 11,
          pointerEvents: 'none',
          padding: 'clamp(3rem, 6vw, 5rem) 1.5rem 0',
        }}>
          {/* Sunray burst behind header */}
          <svg viewBox="0 0 600 300" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(700px,100%)', opacity: 0.05, pointerEvents: 'none' }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return <line key={i} x1="300" y1="150" x2={300 + Math.cos(angle) * 320} y2={150 + Math.sin(angle) * 320} stroke="#fae185" strokeWidth="1" />;
            })}
          </svg>

          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* Top ornament */}
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

            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(0.55rem,1vw,0.65rem)', fontWeight: 800, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(250,225,133,0.65)', marginBottom: '0.75rem' }}>✦ LEAP 2026 ✦</p>

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

        {/* Interactive Elements Overlay - positioned in lower portion of canvas */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'visible',
          paddingTop: isMobile ? '240px' : '380px'
        }}>
          <div style={isMobile ? {
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            padding: '0 1rem',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            rowGap: '2rem',
            pointerEvents: 'none',
          } : { position: 'relative', width: 1440, height: 500, flexShrink: 0, pointerEvents: 'none' }}>
            {/* ── Palayan ng Karunungan ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Palayan ng Karunungan', 80, 285,
                <svg width="130" height="150" viewBox="0 0 130 150">
                  {[20, 42, 64, 86, 108].map((x, i) => (
                    <g key={i}>
                      <path d={`M${x} 148 Q${x + (i % 2 ? 3 : -3)} 100 ${x + (i % 2 ? -2 : 2)} 55 Q${x} 28 ${x + (i % 2 ? 2 : -2)} 5`} stroke="#4a7a20" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                      {[5, 15, 25, 35, 45].map((y, gi) => (
                        <ellipse key={gi} cx={x + (gi % 2 === 0 ? -4 : 4) + (i % 2 ? 1 : -1)} cy={y} rx="5" ry="8" fill="#d4a030" opacity="0.9" transform={`rotate(${gi % 2 === 0 ? -22 : 22},${x + (gi % 2 === 0 ? -4 : 4)},${y})`} />
                      ))}
                    </g>
                  ))}
                </svg>
              )}
            </div>

            {/* ── Bahay ng Bayanihan ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Bahay ng Bayanihan', 280, 265,
                <svg width="170" height="180" viewBox="0 0 170 180">
                  <ellipse cx="85" cy="175" rx="75" ry="10" fill="rgba(250,225,133,0.12)" />
                  <rect x="20" y="115" width="7" height="60" rx="3" fill="#7a5030" />
                  <rect x="70" y="115" width="7" height="60" rx="3" fill="#7a5030" />
                  <rect x="95" y="115" width="7" height="60" rx="3" fill="#7a5030" />
                  <rect x="143" y="115" width="7" height="60" rx="3" fill="#7a5030" />
                  <rect x="10" y="110" width="150" height="8" rx="3" fill="#8a6038" />
                  <rect x="14" y="52" width="142" height="60" rx="2" fill="#c49a72" />
                  <rect x="70" y="72" width="32" height="40" rx="2" fill="#5a3520" />
                  <rect x="72" y="74" width="13" height="36" rx="1" fill="#6a4028" />
                  <rect x="87" y="74" width="13" height="36" rx="1" fill="#6a4028" />
                  <rect x="20" y="66" width="34" height="24" rx="2" fill="#ffd966" opacity="0.7" />
                  <line x1="37" y1="66" x2="37" y2="90" stroke="#8a6038" strokeWidth="1.5" />
                  <line x1="20" y1="78" x2="54" y2="78" stroke="#8a6038" strokeWidth="1.5" />
                  <rect x="116" y="66" width="28" height="24" rx="2" fill="#ffd966" opacity="0.6" />
                  <path d="M-5 54 L85 4 L175 54Z" fill="#c8a46e" />
                  <path d="M85 4 L175 54 L145 54Z" fill="rgba(0,0,0,0.18)" />
                  {[20, 50, 85, 118, 148].map((x, i) => <line key={i} x1="85" y1="4" x2={x} y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />)}
                  <ellipse cx="85" cy="4" rx="6" ry="5" fill="#b08040" />
                  <rect x="-5" y="51" width="180" height="5" rx="2" fill="rgba(0,0,0,0.15)" />
                </svg>
              )}
            </div>

            {/* ── Palaisdaan ng Kalusugan ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Palaisdaan ng Kalusugan', 480, 345,
                <svg width="200" height="130" viewBox="0 0 200 130">
                  <ellipse cx="100" cy="115" rx="90" ry="10" fill="rgba(74,160,185,0.3)" />
                  {[40, 80, 120, 160].map((x, i) => <path key={i} d={`M${x} 115 Q${x + 20} 112 ${x + 40} 115`} stroke="rgba(150,220,240,0.4)" strokeWidth="1.2" fill="none" />)}
                  <path d="M10 85 Q100 105 190 85 L180 110 Q100 125 20 110Z" fill="#8b5e3c" />
                  <path d="M10 85 Q100 105 190 85 L185 95 Q100 115 15 95Z" fill="#a0703c" />
                  {[0, 1, 2].map(i => <path key={i} d={`M${20 + i * 55} 88 Q${20 + i * 55 + 27} 100 ${20 + i * 55 + 55} 88`} stroke="rgba(60,30,10,0.3)" strokeWidth="1.2" fill="none" />)}
                  <path d="M30 88 L20 72 L180 72 L170 88" fill="none" stroke="#7a5028" strokeWidth="2.5" />
                  <rect x="18" y="68" width="164" height="5" rx="2" fill="#9a6840" />
                  <line x1="100" y1="88" x2="100" y2="25" stroke="#6a4020" strokeWidth="3" />
                  <path d="M100 28 L100 78 L148 60Z" fill="rgba(230,200,130,0.85)" stroke="#c8a060" strokeWidth="1" />
                  <ellipse cx="100" cy="118" rx="60" ry="5" fill="rgba(153,217,235,0.2)" />
                </svg>
              )}
            </div>

            {/* ── Dambana ng Pagkakaisa ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Dambana ng Pagkakaisa', 700, 240,
                <svg width="150" height="200" viewBox="0 0 150 200">
                  <ellipse cx="75" cy="100" rx="60" ry="80" fill="rgba(78,207,138,0.08)" />
                  <rect x="62" y="100" width="26" height="95" rx="8" fill="#5a4020" />
                  <rect x="68" y="100" width="14" height="95" rx="6" fill="#7a5a28" />
                  <path d="M70 130 Q55 150 50 190" stroke="#6a4820" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M80 145 Q92 165 95 190" stroke="#6a4820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M65 160 Q45 175 42 195" stroke="#5a4018" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <ellipse cx="75" cy="80" rx="58" ry="52" fill="#1e6030" />
                  <ellipse cx="45" cy="90" rx="38" ry="32" fill="#256835" />
                  <ellipse cx="105" cy="88" rx="36" ry="30" fill="#1d5a2c" />
                  <ellipse cx="75" cy="50" rx="48" ry="40" fill="#2a7a38" />
                  <ellipse cx="75" cy="38" rx="32" ry="26" fill="#318040" />
                  {[[30, 70], [120, 65], [55, 40], [95, 42], [70, 30], [140, 80], [25, 90]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#4ecf8a" opacity="0.7">
                      <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <rect x="58" y="190" width="34" height="5" rx="2" fill="#8a6030" />
                  <path d="M62 185 L75 175 L88 185Z" fill="#c8a050" />
                </svg>
              )}
            </div>

            {/* ── Pamilihan ng Kakayahan ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Pamilihan ng Kakayahan', 940, 320,
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <rect x="10" y="100" width="140" height="8" rx="3" fill="#8a5e30" />
                  <rect x="15" y="108" width="6" height="45" rx="2" fill="#7a5028" />
                  <rect x="139" y="108" width="6" height="45" rx="2" fill="#7a5028" />
                  <path d="M0 35 L160 35 L150 70 L10 70Z" fill="#c8402a" opacity="0.85" />
                  <path d="M0 35 L160 35 L160 40 L0 40Z" fill="#a83020" />
                  {[20, 45, 70, 95, 120, 145].map((x, i) => <path key={i} d={`M${x} 70 L${x - 5} 80`} stroke="#c8402a" strokeWidth="3" strokeLinecap="round" />)}
                  <path d="M48 55 L56 98 L104 98 L112 55Z" fill="#c88030" />
                  {[62, 72, 82, 92].map((y, i) => [50, 65, 80, 95, 108].map((x, j) => (
                    <path key={`${i}-${j}`} d={`M${x + 4} ${y} L${x + 12} ${y + 7} L${x + 4} ${y + 14} L${x - 4} ${y + 7}Z`} fill={(i + j) % 2 === 0 ? 'rgba(210,140,30,0.6)' : 'rgba(170,90,15,0.45)'} stroke="rgba(100,50,0,0.2)" strokeWidth="0.4" />
                  )))}
                  <ellipse cx="80" cy="98" rx="30" ry="5" fill="#a06020" />
                  <path d="M56 55 Q58 38 68 28 Q80 20 92 28 Q102 38 104 55" fill="none" stroke="#c07020" strokeWidth="6" strokeLinecap="round" />
                  <ellipse cx="30" cy="99" rx="16" ry="10" fill="#d4922a" />
                  <ellipse cx="130" cy="99" rx="14" ry="9" fill="#de9a49" />
                </svg>
              )}
            </div>

            {/* ── Plaza ng Malikhaing Diwa ── */}
            <div style={{ pointerEvents: 'auto' }}>
              {btn('Plaza ng Malikhaing Diwa', 1170, 275,
                <svg width="180" height="190" viewBox="0 0 180 190">
                  <path d="M0 30 Q45 50 90 35 Q135 20 180 40" stroke="#8a6030" strokeWidth="2" fill="none" />
                  {[8, 28, 48, 68, 88, 108, 128, 148, 168].map((x, i) => {
                    const y = 30 + Math.sin((x / 180) * Math.PI) * 15;
                    const colors = ['#e8402a', '#fae185', '#4ab068', '#4ab0c8', '#de9a49', '#c870a0'];
                    return <path key={i} d={`M${x} ${y} L${x + 10} ${y + 18} L${x + 18} ${y}Z`} fill={colors[i % colors.length]} opacity="0.9" />;
                  })}
                  <path d="M10 55 Q90 70 170 55" stroke="#6a4820" strokeWidth="1.5" fill="none" />
                  {[18, 40, 62, 84, 106, 128, 150].map((x, i) => {
                    const y = 55 + Math.sin((x / 180) * Math.PI) * 8;
                    const colors = ['#fae185', '#c870a0', '#e8402a', '#4ab068', '#de9a49'];
                    return <path key={i} d={`M${x} ${y} L${x + 9} ${y + 15} L${x + 17} ${y}Z`} fill={colors[i % colors.length]} opacity="0.85" />;
                  })}
                  <g transform="translate(90,135)">
                    <path d="M0 0 L-72 68 Q-76 76 -66 80 Q0 88 66 80 Q76 76 72 68Z" fill="#e8c07a" />
                    <path d="M0 0 L72 68 Q76 76 66 80 Q33 85 0 85Z" fill="rgba(0,0,0,0.15)" />
                    {[22, 42, 60, 76].map((y, i) => { const w = 18 + i * 14; return <path key={i} d={`M${-w} ${y} Q0 ${y - 3} ${w} ${y}`} fill="none" stroke="rgba(100,60,10,0.25)" strokeWidth="1.5" />; })}
                    <circle cx="0" cy="0" r="7" fill="#b07020" />
                    <circle cx="0" cy="0" r="3.5" fill="#de9a49" />
                    <ellipse cx="0" cy="78" rx="78" ry="12" fill="#d4a84e" />
                  </g>
                </svg>
              )}
            </div>

            {/* Decorative Palms */}
            <svg width="60" height="200" viewBox="0 0 60 200" style={{ position: 'absolute', left: -60, top: 250, pointerEvents: 'none', opacity: 0.6 }}>
              <path d="M30 198 Q28 155 25 110 Q22 75 30 40" stroke="#7a5a30" strokeWidth="9" fill="none" strokeLinecap="round" />
              {[[-130, 80], [-100, 90], [-70, 88], [-40, 82], [-10, 76], [20, 70]].map(([angle, len], i) => (
                <path key={i} d={`M30 40 Q${30 + Math.cos((angle as number) * Math.PI / 180) * (len as number / 2)} ${40 + Math.sin((angle as number) * Math.PI / 180) * (len as number / 2)} ${30 + Math.cos((angle as number) * Math.PI / 180) * (len as number)} ${40 + Math.sin((angle as number) * Math.PI / 180) * (len as number)}`} stroke="#1a6030" strokeWidth="3" fill="none" strokeLinecap="round" />
              ))}
            </svg>
            <svg width="60" height="200" viewBox="0 0 60 200" style={{ position: 'absolute', right: -60, top: 260, pointerEvents: 'none', opacity: 0.6 }}>
              <path d="M30 198 Q32 155 35 110 Q38 75 30 42" stroke="#7a5a30" strokeWidth="8" fill="none" strokeLinecap="round" />
              {[[-50, 80], [-20, 88], [10, 85], [40, 80], [70, 75], [100, 70]].map(([angle, len], i) => (
                <path key={i} d={`M30 42 Q${30 + Math.cos((angle as number) * Math.PI / 180) * (len as number / 2)} ${42 + Math.sin((angle as number) * Math.PI / 180) * (len as number / 2)} ${30 + Math.cos((angle as number) * Math.PI / 180) * (len as number)} ${42 + Math.sin((angle as number) * Math.PI / 180) * (len as number)}`} stroke="#1a6030" strokeWidth="3" fill="none" strokeLinecap="round" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};