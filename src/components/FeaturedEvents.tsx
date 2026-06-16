import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Bookmark } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent, SlotInfo } from '../services/leapify';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { formatTime } from '../services/utils';
import { getCachedProfile } from '../services/auth';

export default function FeaturedEvents() {
  const [events, setEvents] = useState<LeapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotsMap, setSlotsMap] = useState<Map<string, SlotInfo>>(new Map());
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const [drawerSlot, setDrawerSlot] = useState<SlotInfo | null | undefined>(undefined);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => getCachedProfile() !== null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const check = () => setIsLoggedIn(getCachedProfile() !== null);
    window.addEventListener('storage', check);
    window.addEventListener('leapify-auth-change', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('leapify-auth-change', check);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    leapifyApi.getBookmarks().then(bms => {
      setBookmarkedIds(new Set(bms.map(b => b.event.id)));
    }).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    leapifyApi.getEvents()
      .then((data) => {
        setEvents((data ?? []).filter((e) => e.isSpotlight));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setLoading(false);
      });
  }, []);

  // Poll slots for all spotlight events every 5s (shared cache via leapifyApi.getSlots)
  useEffect(() => {
    if (events.length === 0) return;
    let cancelled = false;
    const fetchSlots = async () => {
      const results = await Promise.allSettled(events.map(e => leapifyApi.getSlots(e.slug)));
      if (cancelled) return;
      const map = new Map<string, SlotInfo>();
      results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) map.set(events[i].id, r.value); });
      setSlotsMap(map);
    };
    fetchSlots();
    const timer = setInterval(fetchSlots, 5_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [events]);

  const dayMap = useMemo(() => {
    const sorted = Array.from(new Set(events.map(e => e.date))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return new Map(sorted.map((d, i) => [d, i + 1]));
  }, [events]);

  const openDrawer = useCallback((event: LeapEvent) => {
    setDrawerClass(event);
    setDrawerSlot(undefined);
    document.body.classList.add('drawer-open');
    leapifyApi.reconcileSlots(event.slug).then((si) => { if (si) setDrawerSlot(si); }).catch(() => {});
    leapifyApi.getSlots(event.slug).then(setDrawerSlot).catch(() => setDrawerSlot(null));
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClass(null);
    setDrawerSlot(undefined);
    document.body.classList.remove('drawer-open');
  }, []);

  const handleBookmarkToggle = useCallback(async (eventId: string) => {
    if (!isLoggedIn || bookmarkPending) return;
    const wasBookmarked = bookmarkedIds.has(eventId);
    setBookmarkedIds(prev => { const n = new Set(prev); wasBookmarked ? n.delete(eventId) : n.add(eventId); return n; });
    setBookmarkPending(eventId);
    try {
      const result = await leapifyApi.toggleBookmark(eventId);
      setBookmarkedIds(prev => { const n = new Set(prev); result.bookmarked ? n.add(eventId) : n.delete(eventId); return n; });
    } catch (err) {
      console.error("[FeaturedEvents] Failed to toggle bookmark:", err);
      setBookmarkedIds(prev => { const n = new Set(prev); wasBookmarked ? n.add(eventId) : n.delete(eventId); return n; });
    } finally {
      setBookmarkPending(null);
    }
  }, [isLoggedIn, bookmarkedIds, bookmarkPending]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '4rem 0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
        <Loader2 size={20} strokeWidth={1.75} style={{ animation: 'faqSpin 0.8s linear infinite' }} />
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ color: 'rgba(255,100,100,0.7)', fontSize: '0.9rem', margin: '0 0 1rem' }}>{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); leapifyApi.getEvents().then((d) => { setEvents((d ?? []).filter(e => e.isSpotlight)); setLoading(false); }).catch((e) => { setError(e instanceof Error ? e.message : 'Error'); setLoading(false); }); }}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
        >Retry</button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
        No featured events yet.
      </div>
    );
  }

  return (
    <>
      <div className="featured-cards-grid">
        {events.map((ev, i) => (
          <ClassCard
            key={ev.id}
            event={ev}
            slotInfo={slotsMap.get(ev.id)}
            dayNumber={dayMap.get(ev.date)}
            imageLoading={i < 3 ? 'eager' : 'lazy'}
            onAction={() => openDrawer(ev)}
            actionLabel="See Details"
          />
        ))}
      </div>

      {mounted && drawerClass && createPortal(
        <div
          className="drawer-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}
        >
          <div className="drawer">
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close">&times;</button>
            <div className="drawer-hero">
              <div className="drawer-poster">
                {drawerClass.backgroundImageUrl
                  ? <img src={drawerClass.backgroundImageUrl} alt={drawerClass.title} />
                  : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)' }} />}
              </div>
              <div className="drawer-header">
                <div className="drawer-tags">
                  <span className="class-theme-tag">{drawerClass.theme.name}</span>
                  <span className="class-day-tag">{drawerClass.date}</span>
                  {drawerClass.isSpotlight && (
                    <span className="class-theme-tag" style={{ background: 'rgba(250,225,133,0.15)', color: '#fae185', borderColor: 'rgba(250,225,133,0.3)' }}>
                      ★ Main Event
                    </span>
                  )}
                </div>
                <h2 className="drawer-title">{drawerClass.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '22.37%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={drawerClass.organization.logoUrl || '/logo/cso-green.png'} alt={drawerClass.organization.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    {drawerClass.organization.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="drawer-body">
              <div className="drawer-meta">
                {drawerClass.classCode && (
                  <div className="drawer-meta-row">
                    <span className="drawer-meta-label">Code</span>
                    <span className="drawer-meta-val">{drawerClass.classCode}</span>
                  </div>
                )}
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Theme</span>
                  <span className="drawer-meta-val">{drawerClass.theme.name}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Date</span>
                  <span className="drawer-meta-val">{drawerClass.date}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Time</span>
                  <span className="drawer-meta-val">{formatTime(drawerClass.startTime)} – {formatTime(drawerClass.endTime)}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Venue</span>
                  <span className="drawer-meta-val">{drawerClass.venue}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Slots</span>
                  <span className="drawer-meta-val">
                    {drawerSlot === undefined ? 'Loading…'
                      : drawerSlot === null ? (drawerClass.maxSlots === 0 ? 'Unlimited' : `${drawerClass.maxSlots} Slots`)
                      : drawerSlot.total === 0 ? 'Unlimited'
                      : `${drawerSlot.total - drawerSlot.registered}/${drawerSlot.total} Slots Left`}
                  </span>
                </div>
              </div>
              <p className="drawer-desc">{drawerClass.description}</p>
            </div>
            <div className="drawer-footer">
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                {isLoggedIn && (
                  <button
                    className="drawer-bookmark-btn"
                    onClick={() => handleBookmarkToggle(drawerClass.id)}
                    disabled={bookmarkPending === drawerClass.id}
                    aria-label={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
                  >
                    <Bookmark size={18} strokeWidth={1.75} fill={bookmarkedIds.has(drawerClass.id) ? 'currentColor' : 'none'} />
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {(() => {
                    const status = computeSlotStatus(drawerClass, drawerSlot ?? undefined);
                    if (status === 'full') {
                      return (
                        <button className="drawer-enroll" disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(180,40,40,0.35)', border: '1px solid rgba(255,136,136,0.25)' }}>
                          Class Full
                        </button>
                      );
                    }
                    if (drawerClass.gformsUrl) {
                      return (
                        <a href={drawerClass.gformsUrl} target="_blank" rel="noopener noreferrer" className="drawer-enroll">
                          Register Now
                          {status === 'limited' && drawerSlot && (
                            <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.75 }}>({drawerSlot.total - drawerSlot.registered} left)</span>
                          )}
                        </a>
                      );
                    }
                    return (
                      <button className="drawer-enroll" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        Registration Unavailable
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
