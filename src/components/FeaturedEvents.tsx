import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent } from '../services/leapify';

const cb = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function FeaturedEvents() {
  const [events, setEvents] = useState<LeapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          onClick={() => { setLoading(true); setError(null); leapifyApi.getEvents().then((d) => { setEvents((d ?? []).filter(e => e.isSpotlight)); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); }); }}
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
    <div style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {events.map((ev) => (
        <article
          key={ev.id}
          style={{
            display: 'grid',
            gridTemplateColumns: ev.backgroundImageUrl ? '1fr 1fr' : '1fr',
            borderRadius: 20,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
          className="featured-card"
        >
          {ev.backgroundImageUrl && (
            <div style={{ aspectRatio: '16/10', overflow: 'hidden', minHeight: 200 }}>
              <img
                src={ev.backgroundImageUrl}
                alt={ev.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.25rem 0.65rem', borderRadius: 6, background: 'rgba(250,225,133,0.15)', color: '#fae185', border: '1px solid rgba(250,225,133,0.25)' }}>
                ★ Main Event
              </span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', padding: '0.25rem 0.65rem', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {ev.date}
              </span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em', padding: '0.25rem 0.65rem', borderRadius: 6, background: 'rgba(222,154,73,0.1)', color: 'rgba(250,225,133,0.7)', border: '1px solid rgba(222,154,73,0.15)' }}>
                {ev.theme.name}
              </span>
            </div>
            <h2 style={{ fontFamily: "'TD-Sulog', serif", fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              {ev.title}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {ev.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
              {[
                { label: 'Time', val: `${ev.startTime} – ${ev.endTime}` },
                { label: 'Venue', val: ev.venue },
                { label: 'By', val: ev.organization.acronym },
                { label: 'Slots', val: ev.maxSlots === 0 ? 'Open' : String(ev.maxSlots) },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>{val}</span>
                </div>
              ))}
            </div>
            {ev.gformsUrl ? (
              <a
                href={ev.gformsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.7rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #4a7a5a 0%, #2a5a3a 100%)', border: 'none', borderRadius: 9999, textDecoration: 'none', cursor: 'pointer', transition: `all 0.2s ${cb}`, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', alignSelf: 'flex-start' }}
                className="featured-register-btn"
              >
                Register Now
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
