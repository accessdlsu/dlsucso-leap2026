import { m } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ArrowLeft,
  Ticket,
} from 'lucide-react';
import { useEvent, useSlots } from '../hooks';
import { PageWrapper } from '../components/PageCommon';

interface EventDetailProps {
  slug: string;
  onBack: () => void;
}

export default function EventDetail({ slug, onBack }: EventDetailProps) {
  const { data: event, loading, error } = useEvent(slug);
  const { data: slots } = useSlots(slug, 10_000);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !event) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-amber-900/60 font-medium">
            {error || 'Event not found'}
          </p>
          <button
            onClick={onBack}
            className="btn-leap-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </PageWrapper>
    );
  }

  const img = event.backgroundImageUrl || 'https://placehold.co/812x510?text=No+Image+Found';
  const time =
    event.startTime && event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime || '';

  return (
    <PageWrapper>
      <main className="container mx-auto px-4 pb-24 pt-28 max-w-4xl">
        {/* Back button */}
        <m.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#803e2f',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back
        </m.button>

        {/* Hero image */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: '1rem',
            overflow: 'hidden',
            marginBottom: '2rem',
            maxHeight: 400,
          }}
        >
          <img
            src={img}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </m.div>

        {/* Content */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Theme tag */}
          {event.theme && (
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(222,154,73,0.15)',
                color: '#de9a49',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              {event.theme.name}
            </span>
          )}

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#1a1008',
              marginBottom: '1rem',
            }}
          >
            {event.title}
          </h1>

          {/* Organization */}
          {event.organization && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#803e2f',
                marginBottom: '1.5rem',
              }}
            >
              by {event.organization.name}
            </p>
          )}

          {/* Meta grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              background: 'rgba(250,225,133,0.08)',
              border: '1px solid rgba(222,154,73,0.15)',
            }}
          >
            {event.date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#de9a49" />
                <span style={{ fontSize: '0.9rem', color: '#334b46' }}>{event.date}</span>
              </div>
            )}
            {time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#de9a49" />
                <span style={{ fontSize: '0.9rem', color: '#334b46' }}>{time}</span>
              </div>
            )}
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#de9a49" />
                <span style={{ fontSize: '0.9rem', color: '#334b46' }}>
                  {event.venue}
                </span>
              </div>
            )}
            {slots && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} color={slots.isFull ? '#b05a32' : '#de9a49'} />
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: slots.isFull ? '#b05a32' : '#334b46',
                    fontWeight: slots.isFull ? 600 : 400,
                  }}
                >
                  {slots.isFull
                    ? 'Full'
                    : `${slots.available} of ${slots.total} slots available`}
                </span>
              </div>
            )}
            {event.price && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={16} color="#de9a49" />
                <span style={{ fontSize: '0.9rem', color: '#334b46' }}>{event.price}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: '2rem' }}>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: '#334b46',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          {/* Registration CTA */}
          {event.gformsUrl && (
            <a
              href={event.gformsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-leap-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.95rem 2.5rem',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Register Now <ExternalLink size={16} />
            </a>
          )}
        </m.div>
      </main>
    </PageWrapper>
  );
}
