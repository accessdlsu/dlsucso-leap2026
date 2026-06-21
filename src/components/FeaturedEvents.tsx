import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import type { LeapEvent } from '../services/leapify';
import { useAllSlots } from '../hooks/useAllSlots';
import { useAllEvents } from '../hooks/useAllEvents';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { SkeletonCarousel } from './skeletons';
import { useBookmarks } from '../hooks/useBookmarks';
import ClassDrawer from './ClassDrawer';
import { useLocale } from '../hooks/useLocale';

export default function FeaturedEvents() {
  const { t } = useLocale();
  const allEvents = useAllEvents();
  const events = useMemo(() => {
    const todayMs = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) + 'T00:00:00+08:00').getTime();
    return allEvents.filter(e => e.isSpotlight && (!e.date || new Date(e.date).getTime() >= todayMs));
  }, [allEvents]);
  const loading = allEvents.length === 0;
  const slotsMap = useAllSlots();
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const { bookmarkedIds, bookmarkPending, handleBookmarkToggle, isLoggedIn } = useBookmarks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openDrawer = useCallback((event: LeapEvent) => {
    setDrawerClass(event);
    document.body.classList.add('drawer-open');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClass(null);
    document.body.classList.remove('drawer-open');
  }, []);

  if (loading) {
    return <SkeletonCarousel count={4} />;
  }

  if (events.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
        No featured events yet.
      </div>
    );
  }

  const drawerFooter = drawerClass && (
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
  );

  return (
    <>
      <div className="featured-cards-grid">
       {events.map((ev, i) => (
           <ClassCard
             key={ev.id}
             event={ev}
             slotInfo={slotsMap.get(ev.slug)}
             imageLoading={i < 3 ? 'eager' : 'lazy'}
             onAction={() => openDrawer(ev)}
             actionLabel={t('see_details')}
           />
         ))}
       </div>

       {mounted && drawerClass && (
         <ClassDrawer
           event={drawerClass}
           onClose={closeDrawer}
           slotsMap={slotsMap}
           footer={drawerFooter}
         />
       )}
    </>
  );
}
