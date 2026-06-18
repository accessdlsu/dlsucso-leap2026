import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Bookmark, BookmarkX, ArrowRight } from 'lucide-react';
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
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[] | null>(null);
  const events = useAllEvents();
  const slotsMap = useAllSlots();
  const [removing, setRemoving] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const prevOpen = useRef(false);

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
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
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
              Saved Classes
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
              <X size={12} strokeWidth={2} /> Close
            </button>
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: '60vh', overflowY: 'auto',
            background: 'rgba(6,12,22,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          }}
        >
          {bookmarks === null ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
              Loading…
            </div>
          ) : bookmarks.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
              No saved classes yet.
            </div>
          ) : (
            <>
              {bookmarks.map(bm => {
                const ev = events.find(e => e.id === bm.event.id);
                const slotInfo = slotsMap.get(bm.event.slug);
                const isFull = ev ? computeSlotStatus(ev, slotInfo) === 'full' : false;
                return (
                  <div
                    key={bm.event.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: isFull ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '22.37%', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <OrgLogo logoUrl={ev?.organization.logoUrl ?? null} acronym={ev?.organization.acronym ?? '?'} size={36} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev?.title ?? '…'}
                        </span>
                        {isFull && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,100,100,0.8)', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                            Full
                          </span>
                        )}
                      </div>
                      {ev && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                          {ev.organization.name} · {ev.theme.name}
                        </div>
                      )}
                    </div>
                    <a
                      href={`/classes?search=${encodeURIComponent(ev?.title ?? '')}`}
                      onClick={onClose}
                      style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none', padding: 6 }}
                      title="View in Classes"
                    >
                      <ArrowRight size={14} strokeWidth={2} />
                    </a>
                    <button
                      onClick={() => handleRemove(bm.event.id)}
                      disabled={removing === bm.event.id}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                        color: removing === bm.event.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,80,80,0.65)',
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                        transition: 'color 0.15s',
                      }}
                      title="Remove bookmark"
                    >
                      <BookmarkX size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
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
                View all in Classes
                <ArrowRight size={13} strokeWidth={2} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
