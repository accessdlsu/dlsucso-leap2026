import { m } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const PageWrapper = ({ children, className, style }: PageWrapperProps) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`flex-grow${className ? ` ${className}` : ''}`}
    style={style}
  >
    {children}
  </m.div>
);

interface PageHeroProps {
  title: string;
  subtitle: string;
  accent: string;
  className?: string;
  style?: CSSProperties;
  titleStyle?: CSSProperties;
  subtitleStyle?: CSSProperties;
  children?: ReactNode;
}

export const PageHero = ({ title, subtitle, accent, className, style, titleStyle, subtitleStyle, children }: PageHeroProps) => (
  <div className={`page-hero${className ? ` ${className}` : ''}`} style={{ paddingTop: 'clamp(6rem, 12vw, 10rem)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', textAlign: 'center', position: 'relative', overflow: 'hidden', ...style }}>
    {children}
    <div className="page-hero-glow" />
    <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#de9a49', marginBottom: '1rem' }}>
      {accent}
    </m.p>
    <m.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="page-hero-title" style={titleStyle}>
      {title}
    </m.h1>
    <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
      className="page-hero-subtitle" style={subtitleStyle}>
      {subtitle}
    </m.p>
    <m.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
      style={{ width: 60, height: 2, background: 'linear-gradient(90deg,transparent,#de9a49,transparent)', margin: '2rem auto 0' }} />
  </div>
);
