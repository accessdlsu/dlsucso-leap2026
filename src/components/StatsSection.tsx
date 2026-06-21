import { useAllEvents } from "../hooks/useAllEvents";
import { useLocale } from "../hooks/useLocale";

interface Props {
  subthemeCount: number;
  dayCount: number;
}

export default function StatsSection({ subthemeCount, dayCount }: Props) {
  const { t } = useLocale();
  const allEvents = useAllEvents();
  const classCount = allEvents.length > 0 ? allEvents.length : null;

  const stats = [
    { value: classCount, label: t('stats_label_classes') },
    { value: subthemeCount, label: t('stats_label_subthemes') },
    { value: dayCount, label: t('stats_label_days') },
  ];

  return (
    <div className="stats-section">
      <div className="stats-tagline-wrap">
        <h2 className="stats-tagline">
          {t('stats_tagline_fil')}<br />
          {t('stats_tagline_fil2')}
        </h2>
        <p className="stats-subtitle">
          <em>{t('stats_quote')}</em>
          <br />
          {t('stats_subtitle_browse')}
        </p>
      </div>
      <div className="stats-counters">
        {stats.map(({ value, label }) => (
          <div className="stats-counter" key={label}>
            <span className="stats-number">
              {value === null ? "—" : value}
            </span>
            <span className="stats-label">{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.85rem",
          color: "rgba(255, 255, 255, 0.45)",
          margin: 0,
          fontStyle: "italic",
        }}>
          {t('stats_more_coming')}
        </p>
        <a href="/classes" className="stats-cta">{t('stats_browse_classes')}</a>
      </div>
    </div>
  );
}
