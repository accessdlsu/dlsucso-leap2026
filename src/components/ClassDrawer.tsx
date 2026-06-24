import { createPortal } from 'react-dom';
import type { LeapEvent, SlotInfo } from '../services/leapify';
import { computeSlotStatus } from './ClassCard';
import { formatTime } from '../services/utils';
import { getDayNumber } from '../constants/leapDays';
import OrgLogo from './OrgLogo';
import { useLocale } from '../hooks/useLocale';

interface ClassDrawerProps {
  event: LeapEvent;
  onClose: () => void;
  /** @deprecated No longer used; day map is built from LEAP_DAYS constant */
  dayMap?: Map<string, number>;
  /** Slot info map for computing availability */
  slotsMap?: Map<string, SlotInfo>;
  /** Custom footer content (bookmark + enroll buttons) */
  footer?: React.ReactNode;
}

function SlotsDisplay({ event, slotsMap, t }: { event: LeapEvent; slotsMap?: Map<string, SlotInfo>; t: (k: string) => string }) {
  if (!slotsMap) {
    return <>{event.maxSlots === 0 ? t('drawer_unlimited') : `${event.maxSlots} ${t('drawer_slots_label')}`}</>;
  }
  const ds = slotsMap.get(event.slug);
  if (!ds) return <>{event.maxSlots === 0 ? t('drawer_unlimited') : `${event.maxSlots} ${t('drawer_slots_label')}`}</>;
  if (ds.total === 0) return <>{t('drawer_unlimited')}</>;
  const avail = Math.max(0, ds.total - ds.registered);
  return <>{avail === 0 ? t('slots_full') : t(avail === 1 ? 'slots_left_singular' : 'slots_left', { n: avail })}</>;
}

export default function ClassDrawer({ event, onClose, slotsMap, footer }: ClassDrawerProps) {
  const { t } = useLocale();
  const dayNumber = getDayNumber(event.date);

  return createPortal(
    <div
      className="drawer-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="drawer">
        <button className="drawer-close" onClick={onClose} aria-label={t('drawer_close')}>&times;</button>

        {/* Hero: poster + header */}
        <div className="drawer-hero">
          <div className="drawer-poster">
            {event.backgroundImageUrl
              ? <img src={event.backgroundImageUrl} alt={event.title} width={1080} height={1350} decoding="async" />
              : <div className="drawer-poster-placeholder" />}
          </div>
          <div className="drawer-header">
            <div className="drawer-tags">
              <span className="class-theme-tag">{event.theme.name}</span>
              <span className="class-day-tag">{event.date}</span>
              {event.isSpotlight && (
                <span className="class-theme-tag" style={{ background: 'rgba(250,225,133,0.15)', color: '#fae185', borderColor: 'rgba(250,225,133,0.3)' }}>
                  {t('drawer_main_event')}
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
                <span className="drawer-meta-label">{t('drawer_code')}</span>
                <span className="drawer-meta-val">{event.classCode}</span>
              </div>
            )}
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">{t('drawer_theme')}</span>
              <span className="drawer-meta-val">{event.theme.name}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">{t('drawer_date_label')}</span>
              <span className="drawer-meta-val">
                {event.date}
                {dayNumber != null ? ` (${t('day_label', { n: dayNumber })})` : ''}
              </span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">{t('drawer_time_label')}</span>
              <span className="drawer-meta-val">{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">{t('drawer_venue_label')}</span>
              <span className="drawer-meta-val">{event.venue}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-label">{t('drawer_slots_label')}</span>
              <span className="drawer-meta-val">
                <SlotsDisplay event={event} slotsMap={slotsMap} t={t as (k: string) => string} />
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
