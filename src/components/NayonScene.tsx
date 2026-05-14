

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { m, AnimatePresence } from 'framer-motion';

const TOOLTIPS: Record<string, { label: string; desc: string }> = {
  hut1: { label: 'Bahay-Kubo', desc: 'A humble home rooted in community and tradition.' },
  hut2: { label: 'Pavilion', desc: 'A welcoming space for gathering and learning.' },
  palay: { label: 'Palay', desc: 'A symbol of harvest, care, and shared growth.' },
  salakot: { label: 'Salakot', desc: 'A classic Filipino hat for sun and field work.' },
  bayong: { label: 'Bayong', desc: 'A woven bag for everyday market life.' },
  pandesal: { label: 'Pandesal', desc: 'A warm staple that brings people together.' },
};

/* ══════════════════════════════════════════════════════
  PARALLAX MOUSE HOOK
══════════════════════════════════════════════════════ */
function useParallaxMouse() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--px', x.toString());
      document.documentElement.style.setProperty('--py', y.toString());
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}

export default function NayonScene() {
useParallaxMouse();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (key: string, e: ReactMouseEvent) => {
    setHovered(key);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const TOOLTIP_W = 240;
  const TOOLTIP_H = 60;
  const tipX = Math.min(mousePos.x + 16, window.innerWidth - TOOLTIP_W - 12);
  const tipY = Math.max(mousePos.y - TOOLTIP_H - 14, 8);

  return (
    <>
      <AnimatePresence>
        {hovered && (
          <m.div
            key={hovered}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.34, 1.4, 0.64, 1] }}
            style={{
              position: 'fixed',
              left: tipX,
              top: tipY,
              background: 'rgba(8,5,2,0.94)',
              border: '1px solid rgba(222,154,73,0.52)',
              borderRadius: 8,
              padding: '8px 18px',
              pointerEvents: 'none',
              zIndex: 9998,
              backdropFilter: 'blur(14px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: '#fae185', margin: 0, fontWeight: 700 }}>{TOOLTIPS[hovered]?.label}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(249,236,182,0.52)', margin: 0, marginTop: 2 }}>{TOOLTIPS[hovered]?.desc}</p>
          </m.div>
        )}
      </AnimatePresence>

      <div className="nayon-scene-scroll" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 'auto',
        zIndex: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        scrollSnapType: 'x proximity',
        pointerEvents: 'auto',
        willChange: 'transform',
        contain: 'layout style',
      }}>
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="xMidYMax meet"
          style={{
            display: 'block',
            width: 'max(100%, min(1440px, 240vh))',
            height: 'auto',
            minWidth: 'min(1440px, 240vh)',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="volcanoG" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="#1a3520" /><stop offset="100%" stopColor="#0d1e10" />
            </linearGradient>
            <linearGradient id="hill3G" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#193825" /><stop offset="100%" stopColor="#0f2018" />
            </linearGradient>
            <linearGradient id="hill2G" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e4a2c" /><stop offset="100%" stopColor="#12271a" />
            </linearGradient>
            <linearGradient id="hill1G" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#245630" /><stop offset="100%" stopColor="#152e1c" />
            </linearGradient>
            <linearGradient id="groundG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a6234" /><stop offset="100%" stopColor="#1a3a20" />
            </linearGradient>
            <linearGradient id="fadeG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#071a10" stopOpacity="0" />
              <stop offset="60%" stopColor="#0a1e14" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#071810" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="roofG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c8a46e" /><stop offset="100%" stopColor="#9e7844" />
            </linearGradient>
            <linearGradient id="roofG2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b89460" /><stop offset="100%" stopColor="#8e6838" />
            </linearGradient>
            <linearGradient id="wallG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c49a72" /><stop offset="60%" stopColor="#b8875e" /><stop offset="100%" stopColor="#a07040" />
            </linearGradient>
            <linearGradient id="wallG2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4aa82" /><stop offset="60%" stopColor="#c49870" /><stop offset="100%" stopColor="#b08050" />
            </linearGradient>
            <radialGradient id="summitGlow" cx="50%" cy="10%" r="40%">
              <stop offset="0%" stopColor="#de9a49" stopOpacity="0.2" /><stop offset="100%" stopColor="#de9a49" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mistG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ab09a" stopOpacity="0.07" /><stop offset="100%" stopColor="#4ab09a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="palayG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0c84a" /><stop offset="100%" stopColor="#d4922a" />
            </linearGradient>
            <linearGradient id="salakotG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8c07a" /><stop offset="40%" stopColor="#c8963e" /><stop offset="100%" stopColor="#9a6820" />
            </linearGradient>
            <linearGradient id="salakotRimG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d4a84e" /><stop offset="100%" stopColor="#8a5c18" />
            </linearGradient>
            <linearGradient id="bayongG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8a840" /><stop offset="100%" stopColor="#c07820" />
            </linearGradient>
            <radialGradient id="pandesalG" cx="38%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f5c860" /><stop offset="55%" stopColor="#e8a030" /><stop offset="100%" stopColor="#c07018" />
            </radialGradient>
            <radialGradient id="windowGlowG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd966" stopOpacity="0.9" /><stop offset="100%" stopColor="#ff9900" stopOpacity="0.3" />
            </radialGradient>
            <radialGradient id="hutGlowG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fae185" stopOpacity="0.2" /><stop offset="100%" stopColor="#fae185" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="waterG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ab09a" stopOpacity="0.1" /><stop offset="50%" stopColor="#7dd4c4" stopOpacity="0.18" /><stop offset="100%" stopColor="#4ab09a" stopOpacity="0.07" />
            </linearGradient>
            <filter id="glowF" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlowF" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {[[120, 30], [280, 18], [380, 40], [540, 14], [680, 34], [820, 12], [960, 26], [1100, 38], [1240, 16], [1360, 30], [160, 52], [450, 46], [750, 42], [1050, 50], [1300, 54]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill="#fae185" opacity="0.2" className={`star-twinkle star-d${i % 5}`} />
          ))}

          {[[320, 60, 0.75, 0], [380, 48, 0.6, 0.3], [350, 54, 0.65, 0.15], [1060, 66, 0.75, 0.5], [1110, 54, 0.6, 0.7]].map(([x, y, sc, dl], i) => (
            <g key={i} className={`bird bird-d${i}`} style={{ transform: `translate(calc(${x}px + var(--px, 0) * -4px), calc(${y}px + var(--py, 0) * -2px)) scale(${sc})`, animationDelay: `${dl}s` }}>
              <path d="M0 0 Q6 -5 12 0 Q18 -5 24 0" fill="none" stroke="rgba(222,154,73,0.4)" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}

          <g style={{ transform: 'translate(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -5px))' }}>
            <ellipse cx="900" cy="120" rx="300" ry="80" fill="url(#summitGlow)" />
            <path d="M900 18 L710 290 L1090 290 Z" fill="url(#volcanoG)" />
            <path d="M900 18 L1090 290 L1020 290 Z" fill="rgba(0,0,0,0.15)" />
            <path d="M900 18 L882 58 L894 54 L900 30 L906 54 L918 58 Z" fill="rgba(240,235,215,0.2)" />
            <ellipse cx="900" cy="22" rx="14" ry="9" fill="rgba(222,154,73,0.22)" className="volcano-pulse" />
          </g>

          <g style={{ transform: 'translate(calc(var(--px, 0) * -6px), calc(var(--py, 0) * -4px))' }}>
            <path d="M0 250 Q150 195 310 220 Q430 238 550 215 Q620 200 710 290 L0 290 Z" fill="url(#hill3G)" />
            <path d="M1090 290 Q1170 210 1280 200 Q1360 192 1440 220 L1440 290 Z" fill="url(#hill3G)" />
          </g>

          <g style={{ transform: 'translate(calc(var(--px, 0) * -5px), calc(var(--py, 0) * -3px))' }}>
            <path d="M0 295 Q130 255 280 272 Q430 290 560 258 Q680 228 800 265 Q920 302 1060 260 Q1180 225 1310 262 Q1390 282 1440 270 L1440 480 L0 480 Z" fill="url(#hill3G)" />
          </g>
          <g style={{ transform: 'translate(calc(var(--px, 0) * -3px), calc(var(--py, 0) * -2px))' }}>
            <path d="M0 278 Q360 260 720 275 Q1080 290 1440 272 L1440 310 Q1080 328 720 312 Q360 296 0 314 Z" fill="url(#mistG)" />
            <path d="M0 294 Q360 279 720 291 Q1080 303 1440 293 L1440 326 Q1080 326 720 314 Q360 302 0 314 Z" fill="url(#waterG)" />
          </g>
          <g style={{ transform: 'translate(calc(var(--px, 0) * -3px), calc(var(--py, 0) * -2px))' }}>
            <path d="M0 318 Q110 285 250 302 Q400 320 540 290 Q660 264 780 295 Q910 328 1060 290 Q1180 260 1310 290 Q1390 308 1440 298 L1440 480 L0 480 Z" fill="url(#hill2G)" />
          </g>
          <g style={{ transform: 'translate(calc(var(--px, 0) * -1.5px), calc(var(--py, 0) * -1px))' }}>
            <path d="M0 352 Q130 322 300 338 Q460 355 620 325 Q760 298 900 332 Q1050 368 1200 335 Q1330 308 1440 330 L1440 480 L0 480 Z" fill="url(#hill1G)" />
          </g>

          <path d="M0 380 C160 358 320 410 540 380 C760 350 960 408 1180 376 C1340 354 1420 392 1440 382 L1440 480 L0 480 Z"
            fill="url(#groundG)" />
          <path d="M0 405 C200 384 400 428 600 402 C800 376 1000 422 1200 396 C1340 380 1420 412 1440 404 L1440 480 L0 480 Z"
            fill="#1a3a20" opacity="0.55" />
          <path d="M0 380 C160 358 320 410 540 380 C760 350 960 408 1180 376 C1340 354 1420 392 1440 382"
            stroke="#2a6a30" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M0 384 C160 362 320 414 540 384 C760 354 960 412 1180 380 C1340 358 1420 396 1440 386"
            stroke="#1a4a22" strokeWidth="2" fill="none" opacity="0.55" />
          {[
            { x: 40, y: 384 }, { x: 100, y: 376 }, { x: 160, y: 388 }, { x: 220, y: 396 },
            { x: 310, y: 402 }, { x: 400, y: 398 }, { x: 500, y: 386 }, { x: 580, y: 380 },
            { x: 660, y: 374 }, { x: 750, y: 366 }, { x: 840, y: 380 }, { x: 940, y: 396 },
            { x: 1040, y: 400 }, { x: 1140, y: 388 }, { x: 1240, y: 372 }, { x: 1320, y: 368 }, { x: 1380, y: 380 }
          ].map((t, i) => (
            <g key={i} transform={`translate(${t.x}, ${t.y})`}>
              <path d={`M0 0 Q-3 -8 -1 -14 Q1 -8 0 0`} fill="#2a6a30" opacity="0.7" />
              <path d={`M0 0 Q3 -6 5 -11 Q4 -6 0 0`} fill="#2a6a30" opacity="0.55" />
            </g>
          ))}

          <g style={{ transform: 'translate(calc(36px + var(--px, 0) * 7px), calc(226px + var(--py, 0) * 4px))' }}>
            <path d="M0 190 Q3 152 -2 115 Q-5 86 0 56 Q4 26 2 0" stroke="#7a5a30" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M0 190 Q3 152 -2 115 Q-5 86 0 56 Q4 26 2 0" stroke="#a07840" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.3" />
            {[[-140, 88], [-110, 104], [-80, 98], [-50, 92], [-20, 85], [10, 78], [40, 72]].map(([angle, len], i) => {
              const r = ((angle as number) * Math.PI) / 180;
              return <path key={i} d={`M2 0 Q${2 + Math.cos(r) * (len as number) / 2} ${Math.sin(r) * (len as number) / 2} ${2 + Math.cos(r) * (len as number)} ${Math.sin(r) * (len as number)}`} stroke="#1a6030" strokeWidth="3.5" fill="none" strokeLinecap="round" className={`palm-sway palm-d${i % 4}`} />;
            })}
            <ellipse cx="8" cy="-4" rx="7" ry="8" fill="#6a4020" />
            <ellipse cx="-5" cy="2" rx="6" ry="7" fill="#5a3a18" />
          </g>

          <g style={{ transform: 'translate(calc(1398px + var(--px, 0) * 9px), calc(238px + var(--py, 0) * 4px))' }}>
            <path d="M0 178 Q-3 143 2 106 Q5 80 0 52 Q-4 24 -2 0" stroke="#7a5a30" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M0 178 Q-3 143 2 106 Q5 80 0 52 Q-4 24 -2 0" stroke="#a07840" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.28" />
            {[-150, -120, -90, -60, -30, 0, 30].map((angle, i) => {
              const r = (angle * Math.PI) / 180; const len = 76 + i * 5;
              return <path key={i} d={`M-2 0 Q${-2 + Math.cos(r) * len / 2} ${Math.sin(r) * len / 2} ${-2 + Math.cos(r) * len} ${Math.sin(r) * len}`} stroke="#1a6030" strokeWidth="3" fill="none" strokeLinecap="round" className={`palm-sway palm-d${i % 4}`} />;
            })}
            <ellipse cx="-6" cy="-2" rx="6" ry="7" fill="#6a4020" />
            <ellipse cx="4" cy="4" rx="5" ry="6" fill="#5a3a18" />
          </g>

          {/* ── hut1 ── */}
          <g style={{ transform: 'translate(calc(108px + var(--px, 0) * 5px), calc(230px + var(--py, 0) * 3px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('hut1', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'hut1' ? 'url(#glowF)' : undefined}>
            <ellipse cx="94" cy="190" rx="80" ry="13" fill="url(#hutGlowG)" />
            <rect x="18" y="118" width="7" height="68" rx="3" fill="#7a5030" />
            <rect x="68" y="118" width="7" height="68" rx="3" fill="#7a5030" />
            <rect x="118" y="118" width="7" height="68" rx="3" fill="#7a5030" />
            <rect x="158" y="118" width="7" height="68" rx="3" fill="#7a5030" />
            <line x1="21" y1="135" x2="72" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
            <line x1="72" y1="135" x2="21" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
            <line x1="121" y1="135" x2="162" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
            <rect x="8" y="114" width="172" height="9" rx="2" fill="#8a6038" />
            <rect x="12" y="52" width="164" height="64" rx="2" fill="url(#wallG)" />
            <rect x="142" y="52" width="34" height="64" rx="2" fill="rgba(0,0,0,0.12)" />
            <rect x="76" y="76" width="36" height="40" rx="2" fill="#5a3520" />
            <rect x="78" y="78" width="15" height="36" rx="1" fill="#6a4028" />
            <rect x="95" y="78" width="15" height="36" rx="1" fill="#6a4028" />
            <circle cx="93" cy="97" r="2.5" fill="#de9a49" opacity="0.8" />
            <rect x="22" y="68" width="36" height="26" rx="2" fill="url(#windowGlowG)" opacity="0.72" />
            <line x1="40" y1="68" x2="40" y2="94" stroke="#8a6038" strokeWidth="2" />
            <line x1="22" y1="81" x2="58" y2="81" stroke="#8a6038" strokeWidth="2" />
            <ellipse cx="40" cy="81" rx="20" ry="14" fill="#ffcc44" opacity="0.06" className="window-flicker" />
            <rect x="126" y="68" width="36" height="26" rx="2" fill="url(#windowGlowG)" opacity="0.62" />
            <line x1="144" y1="68" x2="144" y2="94" stroke="#8a6038" strokeWidth="2" />
            <line x1="126" y1="81" x2="162" y2="81" stroke="#8a6038" strokeWidth="2" />
            <path d="M-10 54 L94 4 L198 54 Z" fill="url(#roofG)" />
            <path d="M94 4 L198 54 L160 54 Z" fill="rgba(0,0,0,0.18)" />
            <line x1="94" y1="4" x2="20" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <line x1="94" y1="4" x2="50" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <line x1="94" y1="4" x2="80" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <line x1="94" y1="4" x2="110" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <line x1="94" y1="4" x2="140" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <line x1="94" y1="4" x2="168" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
            <ellipse cx="94" cy="4" rx="6" ry="5" fill="#b08040" />
            <rect x="-10" y="52" width="208" height="6" rx="2" fill="rgba(0,0,0,0.15)" />
            <rect x="-10" y="50" width="208" height="4" rx="2" fill="#c89850" opacity="0.48" />
            <path d="M148 50 Q152 40 148 30 Q145 22 150 14" fill="none" stroke="rgba(200,190,170,0.12)" strokeWidth="4.5" strokeLinecap="round" className="smoke-rise" />
            <rect x="88" y="138" width="5" height="46" rx="2" fill="#7a5030" transform="rotate(-8,90,160)" />
            <rect x="100" y="140" width="5" height="46" rx="2" fill="#7a5030" transform="rotate(-8,102,163)" />
            <line x1="88" y1="152" x2="104" y2="148" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
            <line x1="88" y1="163" x2="103" y2="159" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
            <line x1="88" y1="174" x2="103" y2="170" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* ── hut2 ── */}
          <g style={{ transform: 'translate(calc(980px + var(--px, 0) * 3px), calc(255px + var(--py, 0) * 2px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('hut2', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'hut2' ? 'url(#softGlowF)' : undefined}>
            <ellipse cx="80" cy="162" rx="66" ry="11" fill="url(#hutGlowG)" />
            <rect x="16" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
            <rect x="58" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
            <rect x="100" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
            <rect x="136" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
            <rect x="8" y="100" width="148" height="8" rx="2" fill="#8a6038" />
            <rect x="12" y="48" width="140" height="54" rx="2" fill="url(#wallG2)" />
            <rect x="122" y="48" width="30" height="54" rx="2" fill="rgba(0,0,0,0.1)" />
            <rect x="62" y="66" width="30" height="36" rx="2" fill="#5a3520" />
            <rect x="64" y="68" width="12" height="32" rx="1" fill="#6a4028" />
            <rect x="78" y="68" width="12" height="32" rx="1" fill="#6a4028" />
            <circle cx="77" cy="85" r="2" fill="#de9a49" opacity="0.72" />
            <rect x="18" y="60" width="30" height="22" rx="2" fill="url(#windowGlowG)" opacity="0.68" />
            <line x1="33" y1="60" x2="33" y2="82" stroke="#8a6038" strokeWidth="1.5" />
            <line x1="18" y1="71" x2="48" y2="71" stroke="#8a6038" strokeWidth="1.5" />
            <ellipse cx="33" cy="71" rx="16" ry="11" fill="#ffcc44" opacity="0.06" className="window-flicker window-flicker-d1" />
            <path d="M-8 50 L82 4 L168 50 Z" fill="url(#roofG2)" />
            <path d="M82 4 L168 50 L138 50 Z" fill="rgba(0,0,0,0.16)" />
            <line x1="82" y1="4" x2="18" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <line x1="82" y1="4" x2="45" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <line x1="82" y1="4" x2="70" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <line x1="82" y1="4" x2="96" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <line x1="82" y1="4" x2="120" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <line x1="82" y1="4" x2="148" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
            <ellipse cx="82" cy="4" rx="5" ry="5" fill="#b08040" />
            <rect x="8" y="48" width="170" height="5" rx="2" fill="rgba(0,0,0,0.12)" />
            <rect x="8" y="46" width="170" height="4" rx="2" fill="#c89850" opacity="0.4" />
          </g>

          {/* ── palay ── */}
          <g style={{ transform: 'translate(calc(610px + var(--px, 0) * 2px), calc(270px + var(--py, 0) * 1.5px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('palay', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'palay' ? 'url(#softGlowF)' : undefined}>
            <ellipse cx="90" cy="152" rx="92" ry="8" fill="rgba(12,35,12,0.24)" />
            <g className="palay-stalk sway-a" style={{ animationDelay: '0s', transformOrigin: '30px 150px' }}>
              <path d="M30 150 Q28 110 22 70 Q20 50 18 30" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M18 30 Q12 20 8 12 Q6 8 5 4" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[4, 8, 12, 16, 20, 24].map((y, i) => (<ellipse key={i} cx={5 + (i % 2 === 0 ? -3 : 3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-20 + (i % 2) * 40},${5 + (i % 2 === 0 ? -3 : 3)},${y})`} />))}
              <path d="M22 70 Q5 60 -8 55" stroke="#5a9020" strokeWidth="2" fill="none" />
              <path d="M26 90 Q40 78 52 75" stroke="#5a9020" strokeWidth="2" fill="none" />
            </g>
            <g className="palay-stalk sway-b" style={{ animationDelay: '0.4s', transformOrigin: '60px 150px' }}>
              <path d="M60 150 Q58 112 55 72 Q53 52 50 32" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M50 32 Q44 22 40 14 Q38 10 36 5" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[5, 9, 13, 17, 21, 25].map((y, i) => (<ellipse key={i} cx={36 + (i % 2 === 0 ? -3 : 3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-18 + (i % 2) * 36},${36 + (i % 2 === 0 ? -3 : 3)},${y})`} />))}
              <path d="M53 75 Q38 65 25 62" stroke="#5a9020" strokeWidth="2" fill="none" />
              <path d="M55 95 Q70 85 80 82" stroke="#5a9020" strokeWidth="2" fill="none" />
            </g>
            <g className="palay-stalk sway-a" style={{ animationDelay: '0.2s', transformOrigin: '95px 150px' }}>
              <path d="M95 150 Q93 108 90 65 Q88 45 86 22" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M86 22 Q80 12 76 4 Q74 0 72 -4" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[-4, 0, 4, 8, 12, 16, 20].map((y, i) => (<ellipse key={i} cx={72 + (i % 2 === 0 ? -4 : 4)} cy={y} rx="5" ry="7.5" fill="url(#palayG)" transform={`rotate(${-22 + (i % 2) * 44},${72 + (i % 2 === 0 ? -4 : 4)},${y})`} />))}
              <path d="M88 68 Q72 58 58 54" stroke="#5a9020" strokeWidth="2" fill="none" />
              <path d="M90 90 Q106 80 118 76" stroke="#5a9020" strokeWidth="2" fill="none" />
            </g>
            <g className="palay-stalk sway-b" style={{ animationDelay: '0.6s', transformOrigin: '128px 150px' }}>
              <path d="M128 150 Q126 113 123 73 Q121 53 118 33" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M118 33 Q112 23 108 15 Q106 11 104 6" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[6, 10, 14, 18, 22, 26].map((y, i) => (<ellipse key={i} cx={104 + (i % 2 === 0 ? -3 : 3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-20 + (i % 2) * 40},${104 + (i % 2 === 0 ? -3 : 3)},${y})`} />))}
              <path d="M121 76 Q107 65 92 62" stroke="#5a9020" strokeWidth="2" fill="none" />
              <path d="M124 98 Q138 88 150 84" stroke="#5a9020" strokeWidth="2" fill="none" />
            </g>
            <g className="palay-stalk sway-a" style={{ animationDelay: '0.8s', transformOrigin: '158px 150px' }}>
              <path d="M158 150 Q156 115 154 78 Q152 58 150 38" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M150 38 Q144 28 140 20 Q138 16 136 11" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[11, 15, 19, 23, 27, 31].map((y, i) => (<ellipse key={i} cx={136 + (i % 2 === 0 ? -3 : 3)} cy={y} rx="4" ry="6.5" fill="url(#palayG)" transform={`rotate(${-18 + (i % 2) * 36},${136 + (i % 2 === 0 ? -3 : 3)},${y})`} />))}
              <path d="M152 80 Q138 70 124 67" stroke="#5a9020" strokeWidth="2" fill="none" />
              <path d="M154 100 Q168 90 178 87" stroke="#5a9020" strokeWidth="2" fill="none" />
            </g>
            {[10, 30, 50, 70, 90, 110, 130, 150, 170].map((x, i) => (
              <path key={i} d={`M${x} 150 Q${x - 4} 138 ${x - 2} 128`} stroke="#3a7020" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            ))}
          </g>

          {/* ── salakot ── */}
          <g style={{ transform: 'translate(calc(1170px + var(--px, 0) * 4px), calc(315px + var(--py, 0) * 2px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('salakot', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'salakot' ? 'url(#glowF)' : undefined}>
            <ellipse cx="0" cy="155" rx="70" ry="10" fill="rgba(0,0,0,0.25)" />
            <path d="M0 0 L-85 85 Q-90 95 -80 100 Q0 108 80 100 Q90 95 85 85 Z" fill="url(#salakotG)" />
            <path d="M0 0 L85 85 Q90 95 80 100 Q40 105 0 105 Z" fill="rgba(0,0,0,0.15)" />
            {[25, 45, 65, 85].map((y, i) => {
              const w = 22 + (i * 16);
              return <path key={i} d={`M${-w} ${y} Q0 ${y - 4} ${w} ${y}`} fill="none" stroke="rgba(100,60,10,0.25)" strokeWidth="1.5" />;
            })}
            {[-70, -45, -20, 0, 20, 45, 70].map((ang, i) => (
              <line key={i} x1="0" y1="0" x2={Math.sin(ang * Math.PI / 180) * 90} y2={95} stroke="rgba(100,60,10,0.2)" strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="6" fill="#b07020" />
            <circle cx="0" cy="0" r="3" fill="#de9a49" />
            <ellipse cx="0" cy="98" rx="95" ry="14" fill="url(#salakotRimG)" />
            <ellipse cx="0" cy="98" rx="95" ry="14" fill="none" stroke="#de9a49" strokeWidth="1.5" opacity="0.6" />
            <path d="M-40 105 Q-35 125 -30 155" fill="none" stroke="#8a5c18" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 105 Q35 125 30 155" fill="none" stroke="#8a5c18" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="0" cy="155" rx="30" ry="4" fill="#7a4c10" opacity="0.6" />
          </g>

          {/* ── bayong ── */}
          <g style={{ transform: 'translate(calc(1280px + var(--px, 0) * 5px), calc(348px + var(--py, 0) * 3px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('bayong', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'bayong' ? 'url(#softGlowF)' : undefined}>
            <ellipse cx="40" cy="96" rx="44" ry="7" fill="rgba(12,35,12,0.22)" />
            <path d="M10 8 Q4 4 2 0 Q0 -4 4 -8 Q10 -10 16 -8 Q22 -4 20 0 Q18 4 12 8 Z" fill="#de9a49" />
            <path d="M14 8 Q18 4 22 0 Q24 -4 28 -8 Q32 -10 36 -8 Q42 -4 40 0 Q38 4 32 8 Z" fill="#de9a49" />
            <path d="M2 8 L4 90 L76 90 L78 8 Z" fill="url(#bayongG)" />
            {[18, 32, 46, 60, 74].map((y, row) =>
              [8, 22, 36, 50, 64].map((x, col) => (
                <path key={`${row}-${col}`}
                  d={`M${x + 8} ${y} L${x + 16} ${y + 7} L${x + 8} ${y + 14} L${x} ${y + 7} Z`}
                  fill={((row + col) % 2 === 0) ? 'rgba(220,140,20,0.6)' : 'rgba(180,90,10,0.4)'}
                  stroke="rgba(120,60,0,0.25)" strokeWidth="0.5"
                />
              ))
            )}
            <ellipse cx="40" cy="90" rx="38" ry="6" fill="#b06820" />
            <path d="M16 8 Q18 -12 26 -20 Q34 -28 40 -28 Q46 -28 54 -20 Q62 -12 64 8" fill="none" stroke="#c07020" strokeWidth="5" strokeLinecap="round" />
            <path d="M16 8 Q18 -12 26 -20 Q34 -28 40 -28 Q46 -28 54 -20 Q62 -12 64 8" fill="none" stroke="#de9a49" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <path d="M22 -4 Q32 -24 48 -4" fill="none" stroke="rgba(255,200,80,0.4)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ── pandesal ── */}
          <g style={{ transform: 'translate(calc(408px + var(--px, 0) * 3px), calc(352px + var(--py, 0) * 2px))', cursor: 'pointer', pointerEvents: 'all' }}
            onMouseEnter={(e) => handleMouseEnter('pandesal', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            filter={hovered === 'pandesal' ? 'url(#glowF)' : undefined}>
            <ellipse cx="55" cy="108" rx="68" ry="9" fill="rgba(12,35,12,0.24)" />
            <ellipse cx="72" cy="52" rx="62" ry="46" fill="#d4881c" opacity="0.85" />
            <ellipse cx="72" cy="52" rx="62" ry="46" fill="url(#pandesalG)" opacity="0.9" />
            {[[55, 30], [68, 25], [80, 28], [88, 36], [85, 46], [78, 52], [65, 48], [58, 42], [72, 40], [90, 28]].map(([dx, dy], i) => (
              <ellipse key={i} cx={dx} cy={dy} rx="2.5" ry="2" fill="rgba(255,220,120,0.7)" />
            ))}
            <ellipse cx="46" cy="62" rx="64" ry="48" fill="#c07810" opacity="0.9" />
            <ellipse cx="46" cy="62" rx="64" ry="48" fill="url(#pandesalG)" />
            <ellipse cx="28" cy="44" rx="22" ry="14" fill="rgba(255,220,100,0.25)" transform="rotate(-20,28,44)" />
            {[[24, 42], [36, 36], [50, 32], [62, 38], [70, 48], [64, 58], [50, 62], [36, 58], [26, 52], [42, 48], [58, 44]].map(([dx, dy], i) => (
              <ellipse key={i} cx={dx} cy={dy} rx="2.8" ry="2.2" fill="rgba(255,220,120,0.65)" />
            ))}
            <ellipse cx="55" cy="106" rx="66" ry="8" fill="rgba(20,60,20,0.3)" />
          </g>

          <path d="M0 432 C200 422 400 444 600 432 C800 420 1000 442 1200 430 C1340 422 1410 436 1440 430 L1440 480 L0 480 Z"
            fill="url(#groundG)" />
          <path d="M0 442 C200 434 400 452 600 442 C800 432 1000 450 1200 440 C1340 434 1410 444 1440 440 L1440 480 L0 480 Z"
            fill="#1a3a20" opacity="0.7" />
          <path d="M0 432 C200 422 400 444 600 432 C800 420 1000 442 1200 430 C1340 422 1410 436 1440 430"
            stroke="#3a8038" strokeWidth="2" fill="none" opacity="0.55" />
          {[
            { x: 80, y: 426 }, { x: 200, y: 422 }, { x: 320, y: 432 }, { x: 440, y: 440 },
            { x: 560, y: 434 }, { x: 680, y: 426 }, { x: 820, y: 424 }, { x: 960, y: 436 },
            { x: 1100, y: 442 }, { x: 1240, y: 432 }, { x: 1360, y: 426 }
          ].map((t, i) => (
            <g key={`fg-${i}`} transform={`translate(${t.x}, ${t.y})`}>
              <path d={`M0 0 Q-2 -7 -1 -12 Q1 -7 0 0`} fill="#3a8038" opacity="0.7" />
              <path d={`M0 0 Q2 -5 4 -10 Q3 -5 0 0`} fill="#2a6a30" opacity="0.6" />
            </g>
          ))}
          <rect x="0" y="455" width="1440" height="25" fill="url(#fadeG)" />
        </svg>
        <style>{`
          .nayon-scene-scroll::-webkit-scrollbar { display: none; }
          @media (max-width: 768px) {
            .nayon-scene-scroll {
              scroll-snap-type: x mandatory;
              padding-bottom: 4px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
