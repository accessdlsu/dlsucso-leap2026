import type { CSSProperties } from 'react';
import { FIREFLY_CONFIG } from '../../utils';

export const Fireflies = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 3,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {FIREFLY_CONFIG.map((f) => (
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
          transform: 'translate(0, 0)',
          boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.7)`,
        } as CSSProperties}
      />
    ))}
  </div>
);

// fallow-ignore-next-line unused-export
export const PageHeroFireflies = () => (
  <div className="page-hero-fireflies">
    {Array.from({ length: 6 }).map((_, i) => (
      <span key={i} />
    ))}
  </div>
);
