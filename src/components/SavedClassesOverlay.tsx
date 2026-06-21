import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocale } from '../hooks/useLocale';
import { createPortal } from 'react-dom';
import { X, Bookmark, BookmarkX, ArrowRight, Clock } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { BookmarkEntry } from '../services/leapify';
import { useAllEvents } from '../hooks/useAllEvents';
import { computeSlotStatus } from './ClassCard';
import { useAllSlots } from '../hooks/useAllSlots';
import OrgLogo from './OrgLogo';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SavedClassesOverlay({ open, onClose }: Props) {
  const { t } = useLocale();
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[] | null>(null);
  const events = useAllEvents();
  const slotsMap = useAllSlots();
  const [removing, setRemoving] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showEnded, setShowEnded] = useState(false);
  const prevOpen = useRef(false);

  const manilaToday = useMemo(() => {
    const d = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    return new Date(d + 'T00:00:00+08:00').getTime();
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setBookmarks(null);
      leapifyApi.getBookmarks()
        .then(bms => setBookmarks(bms))
        .catch(() => setBookmarks([]));
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('search-open');
    } else {
      document.body.classList.remove('search-open');
    }
    return () => { document.body.classList.remove('search-open'); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  async function handleRemove(eventId: string) {
    setRemoving(eventId);
    try {
      await leapifyApi.deleteBookmark(eventId);
      setBookmarks(prev => prev?.filter(b => b.event.id !== eventId) ?? prev);
    } catch {}
    setRemoving(null);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            background: 'rgba(8,14,24,0.90)',
            backdropFilter: 'blur(var(--blur-lg, 0px))',
            WebkitBackdropFilter: 'blur(var(--blur-lg, 0px))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '18px 20px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            animation: 'searchSlideIn 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bookmark size={18} strokeWidth={1.75} style={{ color: 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              {t('saved_classes_title')}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9999, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                padding: '5px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
              }}
            >
              <X size={12} strokeWidth={2} /> {t('close')}
            </button>
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: '60vh', overflowY: 'auto',
            background: 'rgba(6,12,22,0.97)',
            backdropFilter: 'blur(var(--blur, 0px))',
            WebkitBackdropFilter: 'blur(var(--blur, 0px))',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          }}
        >
          {bookmarks === null ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
              {t('loading')}
            </div>
          ) : bookmarks.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
              {t('no_saved')}
            </div>
          ) : (() => {
            const activeBookmarks = bookmarks.filter(bm => {
              const ev = events.find(e => e.id === bm.event.id);
              if (!ev?.date) return true;
              const d = new Date(ev.date).getTime();
              return isNaN(d) || d >= manilaToday;
            });
            const endedBookmarks = bookmarks.filter(bm => {
              const ev = events.find(e => e.id === bm.event.id);
              if (!ev?.date) return false;
              const d = new Date(ev.date).getTime();
              return !isNaN(d) && d < manilaToday;
            });

            const renderBookmarkRow = (bm: BookmarkEntry, isEnded = false) => {
              const ev = events.find(e => e.id === bm.event.id);
              const slotInfo = slotsMap.get(bm.event.slug);
              const isFull = ev ? computeSlotStatus(ev, slotInfo) === 'full' : false;
              return (
                <div
                  key={bm.event.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: isEnded ? 0.45 : (isFull ? 0.5 : 1), transition: 'opacity 0.2s' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '22.37%', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <OrgLogo logoUrl={ev?.organization.logoUrl ?? null} acronym={ev?.organization.acronym ?? '?'} size={36} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: isEnded ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev?.title ?? '…'}
                      </span>
                      {isEnded && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: 'rgba(180,180,180,0.8)', background: 'rgba(180,180,180,0.1)', border: '1px solid rgba(180,180,180,0.2)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                          {t('ended_badge')}
                        </span>
                      )}
                      {!isEnded && isFull && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,100,100,0.8)', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                          {t('slots_full')}
                        </span>
                      )}
                    </div>
                    {ev && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                        {ev.organization.name} · {ev.theme.name}
                        {ev.date && <span> · {ev.date}</span>}
                      </div>
                    )}
                  </div>
                  {!isEnded && (
                    <a
                      href={`/classes?search=${encodeURIComponent(ev?.title ?? '')}`}
                      onClick={onClose}
                      style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none', padding: 6 }}
                      title={t('view_in_classes')}
                    >
                      <ArrowRight size={14} strokeWidth={2} />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(bm.event.id)}
                    disabled={removing === bm.event.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                      color: removing === bm.event.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,80,80,0.65)',
                      display: 'flex', alignItems: 'center', flexShrink: 0,
                      transition: 'color 0.15s',
                    }}
                    title={t('remove_bookmark')}
                  >
                    <BookmarkX size={15} strokeWidth={1.75} />
                  </button>
                </div>
              );
            };

            return (
              <>
                {activeBookmarks.length === 0 && endedBookmarks.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                    {t('no_saved')}
                  </div>
                ) : (
                  <>
                    {activeBookmarks.map(bm => renderBookmarkRow(bm, false))}

                    {endedBookmarks.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowEnded(v => !v)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', padding: '9px 20px',
                            background: 'rgba(255,255,255,0.03)',
                            border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: showEnded ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            cursor: 'pointer', textAlign: 'left',
                          }}
                          aria-expanded={showEnded}
                        >
                          <Clock size={13} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', flex: 1 }}>
                            {t('event_ended_section', { n: endedBookmarks.length })}
                          </span>
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showEnded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.4 }}>
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {showEnded && endedBookmarks.map(bm => renderBookmarkRow(bm, true))}
                      </>
                    )}

                    <a
                      href="/classes"
                      onClick={onClose}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '13px 20px', textDecoration: 'none', position: 'sticky', bottom: 0,
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
                        color: 'rgba(255,255,255,0.45)',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(6,12,22,0.98)',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)')}
                    >
                      {t('view_all_classes')}
                      <ArrowRight size={13} strokeWidth={2} />
                    </a>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>,
    document.body
  );
}
