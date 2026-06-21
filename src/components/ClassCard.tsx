import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { LeapEvent, SlotInfo } from '../services/leapify';
import { shortenVenue, formatTime } from '../services/utils';
import { getDayNumber } from '../constants/leapDays';
import { useLocale } from '../hooks/useLocale';

export const THEME_ACCENTS: Record<string, string> = {
  'palayan': '#c8e6a0',
  'palayan-ng-karunungan': '#c8e6a0',
  'pamilihan': '#ffb68c',
  'pamilihan-ng-kakayahan': '#ffb68c',
  'plaza': '#a0d4f0',
  'plaza-ng-malikhaing-diwa': '#a0d4f0',
  'dambana': '#d4a0e8',
  'dambana-ng-pagkakaisa': '#d4a0e8',
  'palaisdaan': '#80d4b0',
  'palaisdaan-ng-kalusugan': '#80d4b0',
  'bahay': '#f0c080',
  'bahay-ng-bayanihan': '#f0c080',
};

// Pre-computed rgba triplets for dynamic tag colors (avoids color-mix compat issues)
const THEME_RGB: Record<string, string> = {
  'palayan': '200,230,160',
  'palayan-ng-karunungan': '200,230,160',
  'pamilihan': '255,182,140',
  'pamilihan-ng-kakayahan': '255,182,140',
  'plaza': '160,212,240',
  'plaza-ng-malikhaing-diwa': '160,212,240',
  'dambana': '212,160,232',
  'dambana-ng-pagkakaisa': '212,160,232',
  'palaisdaan': '128,212,176',
  'palaisdaan-ng-kalusugan': '128,212,176',
  'bahay': '240,192,128',
  'bahay-ng-bayanihan': '240,192,128',
};

export type SlotStatus = 'available' | 'limited' | 'full' | 'unlimited';

export function computeSlotStatus(event: LeapEvent, slotInfo?: SlotInfo): SlotStatus {
  if (!slotInfo) {
    return event.maxSlots === 0 ? 'unlimited' : 'available';
  }
  if (slotInfo.total === 0) return 'unlimited';
  const available = slotInfo.total - slotInfo.registered;
  if (available <= 0) return 'full';
  if (available / slotInfo.total <= 0.2 || available <= 10) return 'limited';
  return 'available';
}

interface ClassCardProps {
  event: LeapEvent;
  slotInfo?: SlotInfo;
  /** @deprecated dayNumber is now computed from LEAP_DAYS constant; pass event only */
  dayNumber?: number;
  imageLoading?: 'eager' | 'lazy';
  /** Renders an <a> tag — use for gallery carousel */
  actionHref?: string;
  /** Renders a <button> — use for classes page drawer trigger */
  onAction?: () => void;
  actionLabel?: string;
}

function ClassCard({
  event,
  slotInfo,
  dayNumber: _dayNumberDeprecated,
  imageLoading = 'lazy',
  actionHref,
  onAction,
  actionLabel,
}: ClassCardProps) {
  const { t } = useLocale();
  // Compute day number from static LEAP_DAYS constant
  const dayNumber = getDayNumber(event.date);
  
  const handleCardClick = actionHref
    ? () => { window.location.href = actionHref; }
    : onAction;
  const accent = THEME_ACCENTS[event.theme.path] || '#de9a49';
  const rgb = THEME_RGB[event.theme.path] || '222,154,73';
  const parts = event.date.split(' ');
  const month = parts[0] ?? '';
  const dayStr = (parts[1] ?? '').replace(',', '');
  const dayOfWeek = (() => {
    try {
      return new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '';
    }
  })();

  const status = computeSlotStatus(event, slotInfo);
  const regClosed =
    event.registrationEnabled === false ||
    (event.registrationClosesAt != null && event.registrationClosesAt * 1000 < Date.now());
  const available = slotInfo ? Math.max(0, (slotInfo.total || 0) - (slotInfo.registered || 0)) : null;
  const slotsLabel =
    regClosed ? t('reg_closed') :
    status === 'unlimited' ? t('slots_open') :
    status === 'full' ? t('slots_full') :
    slotInfo ? t('slots_left', { n: available ?? 0 }) :
    event.maxSlots === 0 ? t('slots_open') : t('slots_total', { n: event.maxSlots });
  const slotsClass =
    regClosed ? 'red' :
    status === 'full' ? 'red' :
    status === 'limited' ? 'yellow' : 'green';

  return (
    <article
      className="gallery-card"
      style={{ '--accent': accent, cursor: handleCardClick ? 'pointer' : undefined } as React.CSSProperties}
      onClick={handleCardClick}
      role={handleCardClick ? 'button' : undefined}
    >
      <div className="gallery-card-date-badge">
        <span className="badge-week">{dayOfWeek.toUpperCase()}</span>
        <hr className="badge-divider" />
        <span className="badge-month">{month.toUpperCase()}</span>
        <span className="badge-day">{dayStr}</span>
      </div>

      <div className="gallery-card-org-logo">
        <img
          src={event.organization.logoUrl || '/logo/cso-green.png'}
          alt={event.organization.name}
          width={56}
          height={56}
          decoding="async"
          draggable="false"
        />
      </div>

      <img
        src={event.backgroundImageUrl || '/logo/logo-hd.png'}
        alt={event.title}
        className="gallery-card-img"
        width={1080}
        height={1350}
        decoding={imageLoading === 'eager' ? 'sync' : 'async'}
        loading={imageLoading}
        fetchPriority={imageLoading === 'eager' ? 'high' : 'auto'}
        draggable="false"
      />

      <div className="gallery-card-body">
        <div className="card-tags-row">
          <span
            className="card-theme-tag"
            style={{
              color: accent,
              background: `rgba(${rgb}, 0.15)`,
              border: `1px solid rgba(${rgb}, 0.35)`,
            }}
          >
            {event.theme.name}
          </span>
        </div>
        <h3 className="gallery-card-title">{event.title}</h3>
        <div className="gallery-card-info-row">
          <div className="info-item">
            <span className="info-label">{t('time_label')}</span>
            <span className="info-val">
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('venue_label')}</span>
            <span className="info-val">{shortenVenue(event.venue)}</span>
          </div>
          {event.classCode && (
            <div className="info-item">
              <span className="info-label">{t('class_code_label')}</span>
              <span className="info-val">{event.classCode}</span>
            </div>
          )}
        </div>
        <div className="gallery-card-footer-row">
          <span className={`slots-badge ${slotsClass}`}>{slotsLabel}</span>
          {actionHref ? (
            <a
              href={actionHref}
              className="gallery-card-view-more"
              aria-label={`View details for ${event.title}`}
            >
              <span>{actionLabel ?? t('view_more')}</span>
              <ArrowRight size={12} strokeWidth={2.5} />
            </a>
          ) : onAction ? (
            <button className="gallery-card-view-more" onClick={onAction}>
              <span>{actionLabel ?? t('view_more')}</span>
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default memo(ClassCard);
