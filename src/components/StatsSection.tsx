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
    { value: classCount, label: "Classes" },
    { value: subthemeCount, label: "Subthemes" },
    { value: dayCount, label: "Days" },
  ];

  return (
    <div className="stats-section">
      <div className="stats-tagline-wrap">
        <h2 className="stats-tagline">
          Piliin ang iyong landas.<br />
          Palawakin ang iyong mundo.
        </h2>
        <p className="stats-subtitle">
          <em>"Choose your path. Expand your world."</em>
          <br />
          Browse the classes below and register for the ones that call to you.
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
          More LEAP classes to be announced soon.
        </p>
        <a href="/classes" className="stats-cta">{t('stats_browse_classes')}</a>
      </div>
    </div>
  );
}
