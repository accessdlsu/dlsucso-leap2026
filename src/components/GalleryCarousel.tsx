import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, Bookmark } from 'lucide-react';
import type { LeapEvent } from '../services/leapify';
import { useAllSlots } from '../hooks/useAllSlots';
import { useAllEvents } from '../hooks/useAllEvents';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { buildDayMap } from '../services/utils';
import { useBookmarks } from '../hooks/useBookmarks';
import ClassDrawer from './ClassDrawer';

export default function GalleryCarousel() {
  const allEvents = useAllEvents();
  const events = useMemo(() => allEvents.filter(e => e.isSpotlight), [allEvents]);
  const loading = allEvents.length === 0;
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const slotsMap = useAllSlots();
  const { bookmarkedIds, bookmarkPending, handleBookmarkToggle, isLoggedIn } = useBookmarks();

  const openDrawer = useCallback((event: LeapEvent) => {
    setDrawerClass(event);
    document.body.classList.add('drawer-open');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClass(null);
    document.body.classList.remove('drawer-open');
  }, []);

  const trackRef = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);
  const scrollToCardRef = useRef<(idx: number) => void>(() => {});
  // Refs so the native click listener always sees current values
  const eventsRef = useRef<LeapEvent[]>(events);
  const openDrawerRef = useRef<(e: LeapEvent) => void>(openDrawer);
  useEffect(() => { eventsRef.current = events; }, [events]);
  useEffect(() => { openDrawerRef.current = openDrawer; }, [openDrawer]);

  const N = events.length;

  const dayMap = useMemo(() => buildDayMap(events), [events]);

  // Update indicator dots directly (avoids React re-render during scroll)
  const updateDots = (idx: number) => {
    if (!dotRef.current) return;
    const dots = dotRef.current.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === idx);
    }
  };

  useEffect(() => {
    if (loading || N === 0) return;

    const track = trackRef.current;
    if (!track) return;

    // Snapshot the real card nodes (before we inject any clones)
    const realCards = Array.from(track.children) as HTMLElement[];
    if (realCards.length !== N) return;

    // ── Inject BUF=N sentinel clones on each side if N > 3 ───────────────────
    const shouldLoop = N > 3;
    const BUF = shouldLoop ? N : 0;
    const clones: HTMLElement[] = [];

    const makeClone = (source: HTMLElement) => {
      const cl = source.cloneNode(true) as HTMLElement;
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      clones.push(cl);
      return cl;
    };

    if (shouldLoop) {
      // Prepend clones of the LAST N cards (reversed so DOM order is preserved)
      realCards.slice(-BUF).reverse().forEach(c => track.prepend(makeClone(c)));

      // Append clones of the FIRST N cards
      realCards.slice(0, BUF).forEach(c => track.append(makeClone(c)));
    }

    // ── Measurements ─────────────────────────────────────────────────────────
    const getStep = () =>
      realCards[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 20);

    // ── Init: position real card1 in view ────────────────────────────────────
    const init = () => {
      const s = getStep();
      if (s > 0) track.scrollLeft = BUF * s;
      updateDots(0);
    };

    // Run immediately AND after a short delay for slow CSS paint
    init();
    const t = setTimeout(init, 80);

    // Expose scrollToCard so dot buttons can call it
    scrollToCardRef.current = (idx: number) => {
      const s = getStep();
      if (s <= 0) return;
      const loopW = N * s;
      const realStart = BUF * s;
      // Normalise current position before smooth scroll
      let sl = track.scrollLeft;
      if (shouldLoop) {
        if (sl < realStart) { track.scrollLeft = sl + loopW; }
        else if (sl >= realStart + loopW) { track.scrollLeft = sl - loopW; }
      }
      track.scrollTo({ left: realStart + idx * s, behavior: 'smooth' });
      updateDots(idx);
    };

    // ── Teleport: jump when entering clone territory ──────────────────────────
    let jumping = false;

    const teleport = () => {
      if (!shouldLoop || jumping) return;
      const s = getStep();
      const loopW  = N   * s;          // width of one full lap
      const realStart = BUF * s;       // scrollLeft of real card1
      const realEnd   = realStart + loopW;

      if (track.scrollLeft < realStart) {
        jumping = true;
        track.scrollLeft += loopW;
        jumping = false;
      } else if (track.scrollLeft >= realEnd) {
        jumping = true;
        track.scrollLeft -= loopW;
        jumping = false;
      }
      // Update dot indicator for the centered card after teleport
      const sl = track.scrollLeft;
      const offset = sl - realStart;
      const dotIdx = Math.round(offset / s);
      updateDots(Math.max(0, Math.min(N - 1, dotIdx)));
    };

    if (shouldLoop) {
      track.addEventListener('scroll', teleport, { passive: true });
    }

    // ── Pointer drag + velocity-aware elegant snap ────────────────────────────
    let dragX = 0, dragSL = 0, dragging = false;
    let velX = 0, lastMoveX = 0, lastMoveT = 0;
    let dragDistance = 0;

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.gallery-card-view-more')) return;
      dragging = true;
      dragX = lastMoveX = e.clientX;
      dragSL = track.scrollLeft;
      velX = 0;
      dragDistance = 0;
      jumping = true; // disable teleport during drag
      track.setPointerCapture(e.pointerId);
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none';
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - lastMoveT || 1;
      velX = (e.clientX - lastMoveX) / dt;
      dragDistance += Math.abs(e.clientX - lastMoveX);
      lastMoveX = e.clientX;
      lastMoveT = now;
      track.scrollLeft = dragSL + (dragX - e.clientX);
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      track.style.cursor = 'grab';

      const s = getStep();
      const loopW = N * s;
      const realStart = BUF * s;

      const sl = track.scrollLeft;

      const offset = sl - realStart;
      const FLICK = 0.25;
      let idx: number;
      if (velX > FLICK)       idx = Math.floor(offset / s);
      else if (velX < -FLICK) idx = Math.ceil(offset / s);
      else                    idx = Math.round(offset / s);

      const wrappedIdx = shouldLoop ? (((idx % N) + N) % N) : Math.max(0, Math.min(N - 1, idx));
      let normalised = sl;
      if (shouldLoop) {
        if (idx < 0) {
          jumping = true;
          normalised = sl + loopW;
          track.scrollLeft = normalised;
          jumping = false;
        } else if (idx >= N) {
          jumping = true;
          normalised = sl - loopW;
          track.scrollLeft = normalised;
          jumping = false;
        }
      }

      const target = realStart + wrappedIdx * s;
      updateDots(wrappedIdx);

      const onAnimDone = () => {
        jumping = false;
        track.style.scrollSnapType = 'x mandatory';
      };
      if ('onscrollend' in track) {
        track.addEventListener('scrollend', onAnimDone, { once: true });
      } else {
        setTimeout(onAnimDone, 400);
      }

      track.scrollTo({ left: target, behavior: 'smooth' });
    };

    const onClick = (e: MouseEvent) => {
      if (dragDistance > 10) return;

      const card = (e.target as HTMLElement).closest('.gallery-card') as HTMLElement;
      if (!card || !track.contains(card)) return;

      const children = Array.from(track.children);
      const k = children.indexOf(card);
      if (k === -1) return;

      const slideIdx = ((k % N) + N) % N;

      const ev = eventsRef.current[slideIdx];
      if (ev) openDrawerRef.current(ev);
    };

    const onCancel = () => {
      if (!dragging) return;
      dragging = false;
      jumping = false;
      track.style.cursor = 'grab';
      track.style.scrollSnapType = 'x mandatory';
    };

    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onCancel);
    track.addEventListener('click', onClick);

    const ro = new ResizeObserver(() => init());
    ro.observe(track);

    return () => {
      clearTimeout(t);
      clones.forEach(cl => cl.parentNode?.removeChild(cl));
      track.removeEventListener('scroll', teleport);
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onCancel);
      track.removeEventListener('click', onClick);
      ro.disconnect();
    };
  }, [loading, N]);

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes carousel-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '4rem 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
          <Loader2 size={20} strokeWidth={1.75} style={{ animation: 'carousel-spin 0.8s linear infinite' }} />
          Loading events...
        </div>
      </>
    );
  }


  if (events.length === 0) {
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
          title={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
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
    <div className="gallery-outer">
      <div className="gallery-track" ref={trackRef}>
        {events.map((card, i) => (
          <ClassCard
            key={card.id}
            event={card}
            slotInfo={slotsMap.get(card.slug)}
            dayNumber={dayMap.get(card.date)}
            imageLoading={i < 4 ? 'eager' : 'lazy'}
            onAction={() => openDrawer(card)}
            actionLabel="See Details"
          />
        ))}
      </div>
      <div className="gallery-dots" ref={dotRef}>
        {events.map((_, i) => (
          <button
            key={i}
            className="gallery-dot"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToCardRef.current(i)}
          />
        ))}
      </div>

      {drawerClass && (
        <ClassDrawer
          event={drawerClass}
          onClose={closeDrawer}
          dayMap={dayMap}
          slotsMap={slotsMap}
          footer={drawerFooter}
        />
      )}
    </div>
  );
}
