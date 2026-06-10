import { useRef, type ReactNode } from 'react';
import { useVisibility, useScrollTracking } from '../../hooks/useVisibility';

interface TheAwakeningProps {
  children?: ReactNode;
}

export const TheAwakening = ({ children }: TheAwakeningProps) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isVisible = useVisibility(sectionRef);
  const progress = useScrollTracking(sectionRef, isVisible, (rect, vh) => 1 - (rect.top + rect.height / 2) / (vh + rect.height / 2));

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
      {children}

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
