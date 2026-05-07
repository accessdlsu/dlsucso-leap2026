import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { PageWrapper, PageHero } from '../components/PageCommon';
import { leapifyApi } from '../services/leapify';

const ACCENT_COLORS = ['#de9a49', '#4ab09a', '#b05a32', '#5ca0a8', '#803e2f'];

interface MainEvent {
  id: string;
  title: string;
  tag: string;
  date: string;
  time: string;
  venue: string;
  modality: string;
  desc: string;
  img: string;
  accent: string;
  org: string;
  orgLogo: string | null;
  slots: number;
  registrationLink: string;
}

export default function MainEvents() {
  const [events, setEvents] = useState<MainEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await leapifyApi.getEvents();
        const spotlightEvents = allEvents.filter(e => e.isSpotlight || e.status === 'published');

        const mapped: MainEvent[] = spotlightEvents.map((ev, i: number) => {
          let date = '', time = '';
          if (ev.dateTime) {
            const start = new Date(ev.dateTime);
            date = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          } else if (ev.startTime) {
            const start = new Date(ev.startTime);
            date = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          }

          return {
            id: ev.id,
            title: ev.title || 'Untitled Event',
            tag: ev.theme?.name || 'Main Event',
            date,
            time,
            venue: ev.venue || '',
            modality: 'Face-to-Face',
            desc: ev.description || '',
            img: ev.backgroundImageUrl || 'https://placehold.co/420x260?text=No+Image',
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            org: ev.organization?.name || '',
            orgLogo: ev.organization?.logoUrl || null,
            slots: ev.maxSlots || 0,
            registrationLink: ev.gformsUrl || '',
          };
        });

        setEvents(mapped);
      } catch (err) {
        console.error('Leapify API Error (MainEvents page):', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <PageWrapper>
      <PageHero title="Major Events" subtitle="Landmark moments that define the LEAP experience" accent="LEAP 2026 · Schedule" />
      <main className="container mx-auto px-4 pb-24 max-w-5xl pt-8">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
            <div className="leap-spinner" />
          </div>
        ) : events.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(51,75,70,0.5)', padding: '6rem 0' }}>
            No major events have been published yet.
          </p>
        ) : (
          <div className="events-list">
            {events.map((ev: MainEvent, i: number) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                className="event-card"
              >
                <div className="event-img-wrap">
                  <img src={ev.img} alt={ev.title} className="event-img" referrerPolicy="no-referrer" />
                  <div className="event-img-overlay" />
                  <span className="event-tag" style={{ background: ev.accent }}>{ev.tag}</span>
                </div>

                <div className="event-body">
                  {/* Org row */}
                  {ev.org && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {ev.orgLogo ? (
                        <img src={ev.orgLogo} alt={ev.org} referrerPolicy="no-referrer"
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
                    <span className="event-meta-item"><MapPin size={13} />{ev.venue} ({ev.modality})</span>
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
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </PageWrapper>
  );
}