import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Bookmark } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent } from '../services/leapify';
import { useAllSlots } from '../hooks/useAllSlots';
import { useAllEvents } from '../hooks/useAllEvents';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { formatTime } from '../services/utils';
import { getCachedProfile } from '../services/auth';

export default function FeaturedEvents() {
  const allEvents = useAllEvents();
  const events = useMemo(() => allEvents.filter(e => e.isSpotlight), [allEvents]);
  const loading = allEvents.length === 0;
  const slotsMap = useAllSlots();
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
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

  const dayMap = useMemo(() => {
    const sorted = Array.from(new Set(events.map(e => e.date))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return new Map(sorted.map((d, i) => [d, i + 1]));
  }, [events]);

  const openDrawer = useCallback((event: LeapEvent) => {
    setDrawerClass(event);
    document.body.classList.add('drawer-open');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClass(null);
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

  if (events.length === 0 && !loading) {
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
            slotInfo={slotsMap.get(ev.slug)}
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
                    {(() => {
                      const ds = slotsMap.get(drawerClass.slug);
                      if (!ds) return drawerClass.maxSlots === 0 ? 'Unlimited' : `${drawerClass.maxSlots} Slots`;
                      if (ds.total === 0) return 'Unlimited';
                      const a = Math.max(0, ds.total - ds.registered);
                      return a === 0 ? 'Full' : `${a} Slots Left`;
                    })()}
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
                    const ds = slotsMap.get(drawerClass.slug);
                    const status = computeSlotStatus(drawerClass, ds);
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
                          {status === 'limited' && ds && (
                            <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.75 }}>({Math.max(0, ds.total - ds.registered)} left)</span>
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
