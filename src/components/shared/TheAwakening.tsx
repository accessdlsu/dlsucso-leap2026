import { useRef } from 'react';
import { useScrollVisibility } from '../../hooks';

/**
 * TheAwakening - Cinematic dawn transition scene
 */
export const TheAwakening = () => {
  const sectionRef = useRef<HTMLElement>(null!);
  const progress = useScrollVisibility(sectionRef);

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
      {/* Stars (fade out as user scrolls down) */}
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
                opacity: 0.2 + ((i % 4) * 0.15),
                boxShadow: '0 0 6px rgba(250,225,133,0.6)',
                animation: `starTwinkle ${2 + ((i % 4) * 0.5)}s ease-in-out infinite alternate`,
                animationDelay: `${(i * 0.2) % 3}s`,
              }}
            />
          );
        })}
      </div>

      {/* Sun (grows and fades in) */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: `translate(-50%, 0) scale(${0.3 + progress * 0.7})`,
          opacity: progress * 0.9,
          transition: 'all 0.08s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 200 200" width="200" height="200" style={{ opacity: 0.8 }}>
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="#d4a858"
            opacity={0.7 + progress * 0.3}
          />
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(250,225,133,0.4)"
            strokeWidth="8"
          />
        </svg>
      </div>

      {/* Light rays (grow with scroll) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, rgba(250,225,133,${progress * 0.25}) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(to top, rgba(250,225,133,${progress * 0.2}), transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Scroll hint */}
      {progress < 0.1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            opacity: 1 - progress * 10,
            animation: 'bounce 2s infinite',
          }}
        >
          <div style={{ color: 'rgba(250,225,133,0.6)', fontSize: '0.75rem' }}>Scroll to awaken</div>
        </div>
      )}
    </section>
  );
};

export default TheAwakening;
