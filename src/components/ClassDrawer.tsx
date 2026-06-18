import { createPortal } from 'react-dom';
import type { LeapEvent, SlotInfo } from '../services/leapify';
import { computeSlotStatus } from './ClassCard';
import { formatTime } from '../services/utils';
import OrgLogo from './OrgLogo';

interface ClassDrawerProps {
  event: LeapEvent;
  onClose: () => void;
  /** Optional day map for showing "Day N" next to dates */
  dayMap?: Map<string, number>;
  /** Slot info map for computing availability */
  slotsMap?: Map<string, SlotInfo>;
  /** Custom footer content (bookmark + enroll buttons) */
  footer?: React.ReactNode;
}

function SlotsDisplay({ event, slotsMap }: { event: LeapEvent; slotsMap?: Map<string, SlotInfo> }) {
  if (!slotsMap) {
    return <>{event.maxSlots === 0 ? 'Unlimited' : `${event.maxSlots} Slots`}</>;
  }
  const ds = slotsMap.get(event.slug);
  if (!ds) return <>{event.maxSlots === 0 ? 'Unlimited' : `${event.maxSlots} Slots`}</>;
  if (ds.total === 0) return <>Unlimited</>;
  const avail = Math.max(0, ds.total - ds.registered);
  return <>{avail === 0 ? 'Full' : `${avail} Slots Left`}</>;
}

export default function ClassDrawer({ event, onClose, dayMap, slotsMap, footer }: ClassDrawerProps) {
  return createPortal(
    <div
      className="drawer-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="drawer">
        <button className="drawer-close" onClick={onClose} aria-label="Close">&times;</button>

        {/* Hero: poster + header */}
        <div className="drawer-hero">
          <div className="drawer-poster">
            {event.backgroundImageUrl
              ? <img src={event.backgroundImageUrl} alt={event.title} />
              : <div className="drawer-poster-placeholder" />}
          </div>
          <div className="drawer-header">
            <div className="drawer-tags">
              <span className="class-theme-tag">{event.theme.name}</span>
              <span className="class-day-tag">{event.date}</span>
              {event.isSpotlight && (
                <span className="class-theme-tag" style={{ background: 'rgba(250,225,133,0.15)', color: '#fae185', borderColor: 'rgba(250,225,133,0.3)' }}>
                  ★ Main Event
                </span>
              )}
            </div>
            <h2 className="drawer-title">{event.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <OrgLogo logoUrl={event.organization.logoUrl} acronym={event.organization.acronym} size={32} />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {event.organization.name}
              </span>
            </div>
          </div>
        </div>

        {/* Body: meta + description */}
        <div className="drawer-body">
          <div className="drawer-meta">
            {event.classCode && (
              <div className="drawer-meta-row">
                <span className="drawer-meta-label">Code</span>
                <span className="drawer-meta-val">{event.classCode}</span>
              </div>
            )}
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">Theme</span>
              <span className="drawer-meta-val">{event.theme.name}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">Date</span>
              <span className="drawer-meta-val">
                {event.date}
                {dayMap?.get(event.date) != null ? ` (Day ${dayMap.get(event.date)})` : ''}
              </span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">Time</span>
              <span className="drawer-meta-val">{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">Venue</span>
              <span className="drawer-meta-val">{event.venue}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">Slots</span>
              <span className="drawer-meta-val">
                <SlotsDisplay event={event} slotsMap={slotsMap} />
              </span>
            </div>
          </div>
          <p className="drawer-desc">{event.description}</p>
        </div>

        {/* Footer: passed as prop */}
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
