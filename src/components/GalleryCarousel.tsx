import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'LEAP 2026',
    tag: 'Featured Event',
    date: 'May 20, 2026',
    time: '8:00 AM - 6:00 PM',
    venue: 'De La Salle University',
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg',
    accent: '#de9a49',
    desc: 'Isang Nayon, Isang Layunin — a week-long celebration of community, culture, and shared purpose.',
    slots: { remaining: 200, total: 500 }
  },
  { 
    title: 'The Awakening',          
    tag: 'Opening Ceremony', 
    date: 'May 20, 2026', 
    time: '8:00 AM - 12:00 PM',
    venue: 'Henry Lee Irwin Theater', 
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#de9a49', 
    desc: 'The grand opening of LEAP 2026 — a celebration of community and shared purpose.',
    slots: { remaining: 15, total: 150 }
  },
  { 
    title: 'Palayan ng Karunungan',   
    tag: 'Academic Track',   
    date: 'May 21, 2026', 
    time: '1:00 PM - 5:00 PM',
    venue: 'LS Building',             
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#5ca0a8', 
    desc: 'Expand your mind through academic and intellectual pursuits.',
    slots: { remaining: 48, total: 200 }
  },
  { 
    title: 'Bayanihan Festival',      
    tag: 'Community Day',    
    date: 'May 22, 2026', 
    time: '9:00 AM - 4:00 PM',
    venue: 'Gonzaga Field',           
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#4ab09a', 
    desc: 'Experience community service and collective action rooted in Filipino bayanihan spirit.',
    slots: { remaining: 0, total: 120 }
  },
  { 
    title: 'Palaisdaan ng Kalusugan', 
    tag: 'Wellness Day',     
    date: 'May 23, 2026', 
    time: '8:00 AM - 5:00 PM',
    venue: 'Sports Complex',          
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#99d9eb', 
    desc: 'Nurture physical, mental, and emotional well-being through holistic health practices.',
    slots: { remaining: 82, total: 250 }
  },
  { 
    title: 'Plaza ng Malikhaing Diwa',
    tag: 'Arts & Culture',   
    date: 'May 24, 2026', 
    time: '2:00 PM - 6:00 PM',
    venue: 'Henry Lee Irwin Theater', 
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#b05a32', 
    desc: 'Unleash creativity through arts, design, performance, and free expression.',
    slots: { remaining: 12, total: 100 }
  },
  { 
    title: 'Pamilihan ng Kakayahan',  
    tag: 'Skills Fair',      
    date: 'May 25, 2026', 
    time: '10:00 AM - 3:00 PM',
    venue: 'Yuchengco Hall',          
    img: '/tmp/691188401_1293035212930460_4591157215005585726_n.jpg', 
    accent: '#fae185', 
    desc: 'Sharpen practical skills and professional competencies.',
    slots: { remaining: 110, total: 300 }
  },
];

export default function GalleryCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);
  const scrollToCardRef = useRef<(idx: number) => void>(() => {});
  const N = slides.length;

  // Update indicator dots directly (avoids React re-render during scroll)
  const updateDots = (idx: number) => {
    if (!dotRef.current) return;
    const dots = dotRef.current.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === idx);
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Snapshot the 6 real card nodes (before we inject any clones)
    const realCards = Array.from(track.children) as HTMLElement[];
    if (realCards.length !== N) return;

    // ── Inject BUF=N sentinel clones on each side ────────────────────────────
    // Using N clones guarantees that for any viewport width ≤ N×cardStep,
    // no two copies of the same card are simultaneously visible.
    //
    // Layout after injection:
    //  [c1'][c2'][c3'][c4'][c5'][c6']  [card1…card6]  [c1''][c2''][c3''][c4''][c5''][c6'']
    //
    // Scrolling left from card1 → c6', c5'…c1' → teleport → real card6
    // Scrolling right from card6 → c1'', c2''…c6'' → teleport → real card1
    const BUF = N;
    const clones: HTMLElement[] = [];

    const makeClone = (source: HTMLElement) => {
      const cl = source.cloneNode(true) as HTMLElement;
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      clones.push(cl);
      return cl;
    };

    // Prepend clones of the LAST N cards (reversed so DOM order is preserved)
    realCards.slice(-BUF).reverse().forEach(c => track.prepend(makeClone(c)));

    // Append clones of the FIRST N cards
    realCards.slice(0, BUF).forEach(c => track.append(makeClone(c)));

    // ── Measurements ─────────────────────────────────────────────────────────
    const getStep = () =>
      realCards[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 20);

    // ── Init: position real card1 in view ────────────────────────────────────
    // BUF prepended clones × step puts us exactly at card1.
    // The CSS padding (calc(50vw - cardW/2)) ensures card1 is horizontally
    // centred in the viewport regardless of breakpoint.
    const init = () => {
      const s = getStep();
      if (s > 0) track.scrollLeft = BUF * s;
      updateDots(0);
    };

    // Run immediately AND after a short delay for slow CSS paint
    init();
    const t = setTimeout(init, 80);

    // Expose scrollToCard so dot buttons (rendered in JSX) can call it
    scrollToCardRef.current = (idx: number) => {
      const s = getStep();
      if (s <= 0) return;
      const loopW = N * s;
      const realStart = BUF * s;
      // Normalise current position before smooth scroll
      let sl = track.scrollLeft;
      if (sl < realStart) { track.scrollLeft = sl + loopW; }
      else if (sl >= realStart + loopW) { track.scrollLeft = sl - loopW; }
      track.scrollTo({ left: realStart + idx * s, behavior: 'smooth' });
      updateDots(idx);
    };

    // ── Teleport: jump when entering clone territory ──────────────────────────
    let jumping = false;

    const teleport = () => {
      if (jumping) return;
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

    track.addEventListener('scroll', teleport, { passive: true });

    // ── Pointer drag + velocity-aware elegant snap ────────────────────────────
    let dragX = 0, dragSL = 0, dragging = false;
    let velX = 0, lastMoveX = 0, lastMoveT = 0;
    let dragDistance = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragX = lastMoveX = e.clientX;
      dragSL = track.scrollLeft;
      velX = 0;
      dragDistance = 0;
      jumping = true; // disable teleport during drag (prevents onMove ↔ teleport tug-of-war)
      track.setPointerCapture(e.pointerId);
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none';
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - lastMoveT || 1;
      velX = (e.clientX - lastMoveX) / dt; // px/ms, positive = dragging right
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
      const realEnd = realStart + loopW;

      const sl = track.scrollLeft;

      // Determine snap target using velocity:
      //   velX > 0  → finger moved right → scroll went left → snap to PREVIOUS card
      //   velX < 0  → finger moved left  → scroll went right → snap to NEXT card
      //
      // We compute idx in the *extended* space (allowing negative or ≥N values)
      // so that a drag that only reaches a clone but doesn't pass its centre
      // snaps back to the real card on the same side, not across the loop.
      const offset = sl - realStart;
      const FLICK = 0.25; // px/ms threshold
      let idx: number;
      if (velX > FLICK)       idx = Math.floor(offset / s); // previous card
      else if (velX < -FLICK) idx = Math.ceil(offset / s);  // next card
      else                    idx = Math.round(offset / s);  // nearest card

      // Wrap idx into [0, N-1] via modulo, then compute the canonical target
      // scrollLeft in the real zone. If idx fell outside [0, N-1] we teleport
      // the track invisibly first so the smooth scroll stays short.
      const wrappedIdx = ((idx % N) + N) % N;
      let normalised = sl;
      if (idx < 0) {
        // Dragged left past card 0 clone — teleport forward one lap
        jumping = true;
        normalised = sl + loopW;
        track.scrollLeft = normalised;
        jumping = false;
      } else if (idx >= N) {
        // Dragged right past card N-1 clone — teleport back one lap
        jumping = true;
        normalised = sl - loopW;
        track.scrollLeft = normalised;
        jumping = false;
      }

      const target = realStart + wrappedIdx * s;
      updateDots(wrappedIdx);

      // Keep jumping=true so the teleport listener cannot fire during the
      // smooth scroll animation (which may start in clone territory).
      // Both jumping and scrollSnapType are restored once the scroll settles.
      const onAnimDone = () => {
        jumping = false;
        track.style.scrollSnapType = 'x mandatory';
      };
      if ('onscrollend' in track) {
        track.addEventListener('scrollend', onAnimDone, { once: true });
      } else {
        setTimeout(onAnimDone, 400);
      }

      // Smooth scroll to the computed card center
      track.scrollTo({ left: target, behavior: 'smooth' });
    };

    const onClick = (e: MouseEvent) => {
      // If the user dragged, don't trigger click behavior
      if (dragDistance > 10) return;

      const card = (e.target as HTMLElement).closest('.gallery-card') as HTMLElement;
      if (!card || !track.contains(card)) return;

      const children = Array.from(track.children);
      const k = children.indexOf(card);
      if (k === -1) return;

      const slideIdx = k % N;
      scrollToCardRef.current(slideIdx);
    };

    // pointercancel fires when the browser takes over the gesture (e.g. a
    // system dialog, low-priority event, or—before touch-action:pan-y—native
    // scroll). We must NOT call onUp here because scrollTo would fight native
    // momentum. Instead, just reset drag state cleanly.
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

    // ── ResizeObserver: re-init on viewport/orientation change ───────────────
    // This fixes landscape mode where card dimensions change via CSS media
    // queries AFTER the first useEffect run.
    const ro = new ResizeObserver(() => init());
    ro.observe(track);

    // ── Cleanup ───────────────────────────────────────────────────────────────
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
  }, []);

  return (
    <div className="gallery-outer">
      <div className="gallery-track" ref={trackRef}>
        {slides.map((card, i) => {
          const [month, dayStr] = card.date.split(' ');
          const day = dayStr ? dayStr.replace(',', '') : '';
          const dayOfWeek = new Date(card.date).toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <article
              key={i}
              className="gallery-card"
              style={{ '--accent': card.accent } as React.CSSProperties}
            >
              <div className="gallery-card-date-badge">
                <span className="badge-week">{dayOfWeek.toUpperCase()}</span>
                <hr className="badge-divider" />
                <span className="badge-month">{month.toUpperCase()}</span>
                <span className="badge-day">{day}</span>
              </div>
              <div className="gallery-card-org-logo">
                <img src="/logo/cso-green.png" alt="CSO" draggable="false" />
              </div>
              <img
                src={card.img}
                alt={card.title}
                className="gallery-card-img"
                loading={i < 4 ? 'eager' : 'lazy'}
                draggable="false"
              />
              <div className="gallery-card-body">
                <h3 className="gallery-card-title">{card.title}</h3>
                
                <div className="gallery-card-info-row">
                  <div className="info-item">
                    <span className="info-label">TIME</span>
                    <span className="info-val">{card.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">VENUE</span>
                    <span className="info-val">{card.venue}</span>
                  </div>
                </div>
                <div className="gallery-card-footer-row">
                  <div className="gallery-card-slots">
                    {(() => {
                      const { remaining, total } = card.slots;
                      const limit = Math.floor(total * 0.2);
                      if (remaining === 0) {
                        return <span className="slots-badge red">Fully Booked</span>;
                      } else if (remaining <= limit) {
                        return <span className="slots-badge yellow">{remaining} / {total} Slots Left</span>;
                      } else {
                        return <span className="slots-badge green">{remaining} / {total} Slots Left</span>;
                      }
                    })()}
                  </div>
                  <a href={`/classes?search=${encodeURIComponent(card.title)}`} className="gallery-card-view-more" aria-label={`View details for ${card.title}`}>
                    <span>See Details</span>
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="gallery-dots" ref={dotRef}>
        {slides.map((_, i) => (
          <button
            key={i}
            className="gallery-dot"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToCardRef.current(i)}
          />
        ))}
      </div>
    </div>
  );
}
