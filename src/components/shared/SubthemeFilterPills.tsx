import { useRef } from 'react';

export const SubthemeFilterPills = ({
  selectedSubtheme,
  onSubthemeSelect,
  isMobile = false,
}: {
  selectedSubtheme: string | null;
  onSubthemeSelect: (subtheme: string | null) => void;
  isMobile?: boolean;
}) => {
  const SUBTHEMES = [
    {
      key: 'Palayan ng Karunungan',
      label: 'Palayan ng Karunungan',
      bg: 'linear-gradient(135deg, #C9E0E4 0%, #8ab8c0 100%)',
      borderActive: '#C9E0E4',
      textActive: '#0f3a42',
      glow: 'rgba(201,224,228,0.5)',
      accent: '#8ab8c0',
    },
    {
      key: 'Pamilihan ng Kakayahan',
      label: 'Pamilihan ng Kakayahan',
      bg: 'linear-gradient(135deg, #fae185 0%, #d4a838 100%)',
      borderActive: '#fae185',
      textActive: '#2a1a00',
      glow: 'rgba(250,225,133,0.55)',
      accent: '#d4a838',
    },
    {
      key: 'Plaza ng Malikhaing Diwa',
      label: 'Plaza ng Malikhaing Diwa',
      bg: 'linear-gradient(135deg, #d4956a 0%, #9a5828 100%)',
      borderActive: '#d4956a',
      textActive: '#2a1008',
      glow: 'rgba(212,149,106,0.5)',
      accent: '#c07840',
    },
    {
      key: 'Dambana ng Pagkakaisa',
      label: 'Dambana ng Pagkakaisa',
      bg: 'linear-gradient(135deg, #4ecf8a 0%, #16a460 100%)',
      borderActive: '#4ecf8a',
      textActive: '#042818',
      glow: 'rgba(78,207,138,0.45)',
      accent: '#2ab870',
    },
    {
      key: 'Palaisdaan ng Kalusugan',
      label: 'Palaisdaan ng Kalusugan',
      bg: 'linear-gradient(135deg, #99d9eb 0%, #4ab0c8 100%)',
      borderActive: '#99d9eb',
      textActive: '#042838',
      glow: 'rgba(153,217,235,0.5)',
      accent: '#6ac0d8',
    },
    {
      key: 'Bahay ng Bayanihan',
      label: 'Bahay ng Bayanihan',
      bg: 'linear-gradient(135deg, #efe6ad 0%, #c8b060 100%)',
      borderActive: '#efe6ad',
      textActive: '#281e00',
      glow: 'rgba(239,230,173,0.5)',
      accent: '#d4c070',
    },
  ];

  return (
    <div style={{
      marginBottom: '1.75rem',
      position: 'relative',
    }}>
      {/* Ornamental header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          flex: '0 1 60px',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.5))',
        }} />
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#de9a49',
          margin: 0,
          whiteSpace: 'nowrap',
        }}>✦ Filter by Subtheme ✦</p>
        <span style={{
          flex: '0 1 60px',
          height: 1,
          background: 'linear-gradient(90deg, rgba(222,154,73,0.5), transparent)',
        }} />
      </div>

      {/* Pills container */}
      <div 
        className="hide-scrollbar"
        style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: isMobile ? 'flex-start' : 'center',
        gap: '0.5rem',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(255,252,241,0.92), rgba(253,247,228,0.88))',
        borderRadius: '1.5rem',
        border: '1px solid rgba(222,154,73,0.22)',
        boxShadow: '0 8px 32px rgba(51,75,70,0.07), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(222,154,73,0.08)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflowX: isMobile ? 'auto' : 'hidden',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {/* Background palay ornament */}
        {!isMobile && (
          <>
            <svg
              style={{ position: 'absolute', right: 16, top: 8, opacity: 0.07, pointerEvents: 'none' }}
              width="60" height="80" viewBox="0 0 60 80"
            >
              <path d="M30 80 Q28 55 26 35 Q24 18 30 4" stroke="#de9a49" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[4, 15, 26, 37, 48, 59].map((y, i) => (
                <ellipse key={i} cx={30 + (i % 2 === 0 ? -5 : 5)} cy={y} rx="5" ry="8"
                  fill="#de9a49" transform={`rotate(${i % 2 === 0 ? -20 : 20}, ${30 + (i % 2 === 0 ? -5 : 5)}, ${y})`} />
              ))}
            </svg>
            <svg
              style={{ position: 'absolute', left: 16, top: 8, opacity: 0.07, pointerEvents: 'none', transform: 'scaleX(-1)' }}
              width="60" height="80" viewBox="0 0 60 80"
            >
              <path d="M30 80 Q28 55 26 35 Q24 18 30 4" stroke="#de9a49" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[4, 15, 26, 37, 48, 59].map((y, i) => (
                <ellipse key={i} cx={30 + (i % 2 === 0 ? -5 : 5)} cy={y} rx="5" ry="8"
                  fill="#de9a49" transform={`rotate(${i % 2 === 0 ? -20 : 20}, ${30 + (i % 2 === 0 ? -5 : 5)}, ${y})`} />
              ))}
            </svg>
          </>
        )}

        {/* ALL CLASSES pill */}
        <button
          onClick={() => onSubthemeSelect(null)}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          style={{
            position: 'relative',
            padding: '0.6rem 1.4rem',
            borderRadius: 999,
            background: selectedSubtheme === null
              ? 'linear-gradient(135deg, #006937 0%, #004d28 100%)'
              : '#ffffff',
            border: `2px solid ${selectedSubtheme === null ? '#006937' : 'rgba(0,105,55,0.5)'}`,
            color: selectedSubtheme === null ? '#fae185' : '#006937',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
            textTransform: 'uppercase',
            boxShadow: selectedSubtheme === null
              ? '0 4px 18px rgba(0,105,55,0.4), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 2px 8px rgba(0,105,55,0.15)',
            transform: selectedSubtheme === null ? 'translateY(-2px) scale(1.04)' : 'translateY(0) scale(1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
            minHeight: 40,
            flexShrink: 0,
          }}
        >
          {selectedSubtheme === null && (
            <span style={{
              position: 'absolute', inset: 0, borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
          )}
          <svg width="10" height="10" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
            <g transform="translate(6,6)">
              {[0, 60, 120, 180, 240, 300].map((a, i) => {
                const r = a * Math.PI / 180;
                return <line key={i} x1={Math.cos(r) * 2} y1={Math.sin(r) * 2} x2={Math.cos(r) * 5} y2={Math.sin(r) * 5}
                  stroke={selectedSubtheme === null ? '#fae185' : '#4a7a54'} strokeWidth="1.2" strokeLinecap="round" />;
              })}
              <circle r="1.5" fill={selectedSubtheme === null ? '#fae185' : '#4a7a54'} />
            </g>
          </svg>
          All Classes
        </button>

        {/* Vertical divider */}
        <div style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'rgba(222,154,73,0.2)',
          margin: '0.25rem 0.1rem',
          flexShrink: 0,
        }} />

        {/* Subtheme pills */}
        {SUBTHEMES.map((s) => {
          const isActive = selectedSubtheme === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onSubthemeSelect(isActive ? null : s.key)}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              title={s.key}
              style={{
                position: 'relative',
                padding: '0.55rem 1.1rem',
                borderRadius: 999,
                background: isActive ? s.bg : '#ffffff',
                border: `2px solid ${isActive ? s.borderActive : 'rgba(222,154,73,0.5)'}`,
                color: isActive ? s.textActive : '#5a4020',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                boxShadow: isActive
                  ? `0 5px 20px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.1)`
                  : '0 2px 8px rgba(222,154,73,0.15)',
                transform: isActive ? 'translateY(-3px) scale(1.06)' : 'translateY(0) scale(1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                minHeight: 40,
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive && !isMobile) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(-2px) scale(1.03)';
                  el.style.boxShadow = `0 4px 14px ${s.glow}`;
                  el.style.borderColor = s.borderActive;
                  el.style.background = `rgba(${s.glow.replace('rgba(', '').split(',').slice(0, 3).join(',')}, 0.2)`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive && !isMobile) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 2px 8px rgba(222,154,73,0.15)';
                  el.style.borderColor = 'rgba(222,154,73,0.5)';
                  el.style.background = '#ffffff';
                }
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              )}
              {/* Colored dot indicator */}
              <span style={{
                width: isActive ? 7 : 5,
                height: isActive ? 7 : 5,
                borderRadius: '50%',
                background: isActive ? s.textActive : s.accent,
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 0 2px ${s.borderActive}` : 'none',
                display: 'block',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{s.label}</span>
              {isActive && (
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '0.55rem',
                  opacity: 0.75,
                  marginLeft: 1,
                }}>✕</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
