import { useRef } from 'react';
import { useVisibility, useScrollTracking } from '../hooks/useVisibility';

export const MabuhayGreeting = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useVisibility(containerRef);
  const progress = useScrollTracking(containerRef, isVisible, (rect, vh) => 1 - (rect.top + rect.height * 0.6) / vh);

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

      <div style={{
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        maxWidth: 'min(720px, 92vw)',
        width: '100%',
        pointerEvents: 'auto',
      }}>
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
