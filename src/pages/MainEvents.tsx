import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { PageWrapper, PageHero } from '../components/PageCommon';
import { useEvents } from '../hooks';
import type { LeapEvent } from '../services/leapify';

const ACCENT_COLORS = ['#de9a49', '#4ab09a', '#b05a32', '#5ca0a8', '#803e2f'];

interface MainEvent {
  id: string;
  title: string;
  tag: string;
  date: string;
  time: string;
  venue: string;
  desc: string;
  img: string;
  accent: string;
  org: string;
  orgLogo: string | null;
  slots: number;
  registrationLink: string;
}

function mapEvent(ev: LeapEvent, i: number): MainEvent {
  let date = '', time = '';
  if (ev.date) {
    date = ev.date;
  }
  if (ev.startTime && ev.endTime) {
    time = `${ev.startTime} – ${ev.endTime}`;
  } else if (ev.startTime) {
    time = ev.startTime;
  }
  return {
    id: ev.id,
    title: ev.title || 'Untitled Event',
    tag: ev.theme?.name || 'LEAP 2026',
    date,
    time,
    venue: ev.venue || '',
    desc: ev.description || '',
    img: ev.backgroundImageUrl || 'https://placehold.co/812x510?text=No+Image+Found',
    accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
    org: ev.organization?.name || '',
    orgLogo: ev.organization?.logoUrl || null,
    slots: ev.maxSlots || 0,
    registrationLink: ev.gformsUrl || '',
  };
}

export default function MainEvents() {
  const { data: rawEvents, loading } = useEvents();
  const [events, setEvents] = useState<MainEvent[]>([]);

  useEffect(() => {
    const spotlightEvents = rawEvents.filter(e => e.isSpotlight || e.status === 'published');
    setEvents(spotlightEvents.map((ev, i) => mapEvent(ev, i)));
  }, [rawEvents]);

  return (
    <PageWrapper>
      <PageHero title="Major Events" subtitle="The biggest experiences LEAP 2026 has to offer" accent="Featured" />
      <main className="container mx-auto px-4 pb-24">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
          </div>
        )}
        {!loading && events.length === 0 && (
          <p className="text-center py-24 text-amber-900/60 font-medium">No major events announced yet. Check back soon!</p>
        )}
        {!loading && events.length > 0 && (
          <div className="flex flex-col gap-6">
            {events.map((ev, i) => (
              <m.div key={ev.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="event-card"
              >
                <div className="event-card-img-wrap">
                  <img src={ev.img} alt={ev.title} className="event-card-img" loading="lazy" />
                </div>
                <div className="event-card-body">
                  {ev.org && (
                    <div className="event-org-row">
                      {ev.orgLogo ? (
                        <img src={ev.orgLogo} alt={ev.org}
                          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(222,154,73,0.35)' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(222,154,73,0.15)', border: '1px solid rgba(222,154,73,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#de9a49' }}>
                          {ev.org.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#de9a49' }}>
                        {ev.org}
                      </span>
                    </div>
                  )}
                  {/* Meta */}
                  <div className="event-meta">
                    <span className="event-meta-item"><Calendar size={13} />{ev.date}</span>
                    <span className="event-meta-item"><Clock size={13} />{ev.time}</span>
                    <span className="event-meta-item"><MapPin size={13} />{ev.venue}</span>
                    {ev.slots > 0 && (
                      <span className="event-meta-item"><Users size={13} />{ev.slots} slots</span>
                    )}
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-desc">{ev.desc}</p>
                  <div className="event-cta">
                    <div className="event-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="event-divider-line" style={{ background: ev.accent }} />
                    {ev.registrationLink && (
                      <a href={ev.registrationLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1008', background: `linear-gradient(135deg, #fae185, ${ev.accent})`, borderRadius: 6, padding: '0.55rem 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Register <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        )}
      </main>
    </PageWrapper>
  );
}
