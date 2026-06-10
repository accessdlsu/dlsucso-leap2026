import { useState, useEffect } from 'react';
import { m } from 'framer-motion';

export const AnimatedTagline = () => {
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
