import { useState, useEffect, useCallback, useRef } from 'react';

const SECTIONS = [
  { id: 'hero-section',     label: 'Go to Hero Section' },
  { id: 'featured-section', label: 'Go to Featured Events Section' },
  { id: 'classes-section',  label: 'Go to Classes Section' },
  { id: 'subthemes',        label: 'Go to Subthemes Section' },
  { id: 'leapdays',         label: 'Go to LEAP Days Section' },
];

export default function ScrollIndicator() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const updateActive = useCallback((bg: Element) => {
    const st = (bg as HTMLElement).scrollTop;
    let closest = 0;
    let minDist = Infinity;
    SECTIONS.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dist = Math.abs((el as HTMLElement).offsetTop - st);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActive(closest);
  }, []);

  useEffect(() => {
    // Hide on mobile (matches .scroll-indicator CSS breakpoint)
    if (window.innerWidth <= 768) return;

    const bg = document.querySelector('.home-bg');
    if (!bg) return;

    setVisible(true);
    updateActive(bg);

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => updateActive(bg));
    };

    bg.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      bg.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateActive]);

  function scrollTo(id: string) {
    const bg = document.querySelector('.home-bg');
    const el = document.getElementById(id);
    if (bg && el) {
      bg.scrollTo({ top: (el as HTMLElement).offsetTop, behavior: 'smooth' });
    }
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 1002,
      }}
      aria-label="Section navigation"
    >
      {SECTIONS.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          aria-label={label}
          aria-current={active === i ? 'true' : undefined}
          style={{
            width: 10,
            height: active === i ? 24 : 10,
            borderRadius: 9999,
            background: active === i ? '#fae185' : 'rgba(255,255,255,0.25)',
            boxShadow: active === i ? '0 0 8px rgba(250,225,133,0.6)' : 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'height 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            if (active !== i) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={e => {
            if (active !== i) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
          }}
        />
      ))}
    </div>
  );
}
