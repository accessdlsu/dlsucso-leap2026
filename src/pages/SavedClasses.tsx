import { m } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import type { ReactNode } from 'react';
import type { LeapClass } from '../types';
import styles from '../App.module.css';


interface SavedClassesProps {
  filteredAndSortedClasses: LeapClass[];
  savedClassIds: Set<string>;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

const PageWrapper = ({ children }: { children: ReactNode }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      flexGrow: 1,
      background: 'linear-gradient(180deg, #f5f3ec 0%, #ebe8dd 60%, #d8e0d8 100%)',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </m.div>
);

const PageHero = ({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) => (
  <div
    className="page-hero"
    style={{
      paddingTop: 'clamp(6rem, 12vw, 10rem)',
      paddingBottom: 'clamp(2rem, 4vw, 4rem)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div className="page-hero-fireflies">
      <span /><span /><span /><span /><span /><span />
    </div>
    <div className="page-hero-glow" />
    <m.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#de9a49',
        marginBottom: '1rem',
      }}
    >
      {accent}
    </m.p>
    <m.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="page-hero-title"
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: 700,
        color: '#334b46',
        marginBottom: '0.5rem',
      }}
    >
      {title}
    </m.h1>
    <m.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
        color: '#6a5040',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
      }}
    >
      {subtitle}
    </m.p>
  </div>
);

export default function SavedClasses({
  filteredAndSortedClasses,
  savedClassIds,
  renderClassCard,
}: SavedClassesProps) {
  const savedClasses = filteredAndSortedClasses.filter(cls => savedClassIds.has(cls.id));
  const panelStyle = {
    background: 'rgba(255, 253, 245, 0.88)',
    border: '1px solid rgba(222, 154, 73, 0.15)',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(51, 75, 70, 0.06)',
  };

  return (
    <PageWrapper>
      <PageHero
        accent="YOUR SELECTIONS"
        title="Saved Classes"
        subtitle="All the classes you've bookmarked for easy access. Save more classes as you browse to build your perfect schedule."
      />

      <section style={{ padding: 'clamp(1rem, 3vw, 3rem) clamp(0.75rem, 3vw, 1.5rem)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {savedClasses.length === 0 ? (
            <div
              style={{
                ...panelStyle,
                padding: 'clamp(2rem, 5vw, 3.5rem)',
                textAlign: 'center',
                margin: '2rem auto',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 1.5rem',
                  background: 'rgba(222, 154, 73, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bookmark size={40} color="#803e2f" />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                  fontWeight: 700,
                  color: '#334b46',
                  marginBottom: '0.75rem',
                }}
              >
                No Saved Classes Yet
              </h3>
              <p style={{ color: '#7c6b4b', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7 }}>
                Start exploring classes and click the bookmark icon to save your favorites. They'll appear here for quick access.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#classes';
                  location.reload();
                }}
                style={{
                  display: 'inline-block',
                  padding: '0.95rem 2.5rem',
                  background: 'linear-gradient(135deg, #fae185 0%, #de9a49 55%, #c07830 100%)',
                  color: '#1a1008',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderRadius: '1rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Browse All Classes
              </a>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: '#7c6b4b', fontSize: '0.95rem' }}>
                  <Bookmark size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#803e2f' }} />
                  You have <strong>{savedClasses.length}</strong> saved {savedClasses.length === 1 ? 'class' : 'classes'}
                </p>
              </div>
              <div className={styles.classGrid} style={{ gap: '1.25rem' }}>
                {savedClasses.map((item, index) => renderClassCard(item, index))}
              </div>
            </>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
