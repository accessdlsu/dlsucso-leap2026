import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent } from '../services/leapify';

function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="filter-dropdown-wrapper" ref={ref}>
      <button className="filter-dropdown-trigger" onClick={() => setOpen(!open)}>
        <span className="filter-dropdown-label">{label}</span>
        <span className="filter-dropdown-selected">
          {selected ? selected.label : `All ${label}s`}
        </span>
        <svg className={`dropdown-arrow ${open ? 'open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="filter-dropdown-menu">
          <button className={`filter-dropdown-item ${value === null ? 'active' : ''}`} onClick={() => { onChange(null); setOpen(false); }}>
            All {label}s
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`filter-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgLogo({ logoUrl, acronym }: { logoUrl: string | null; acronym: string }) {
  if (!logoUrl) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.55rem', fontWeight: 700,
        color: 'rgba(255,255,255,0.5)', flexShrink: 0,
      }}>{acronym.slice(0, 2)}</span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={acronym}
      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,0.06)' }}
      loading="lazy"
    />
  );
}

export default function ClassesFilter() {
  const [classes, setClasses] = useState<LeapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formAccessStatus, setFormAccessStatus] = useState<{
    checking: boolean;
    result: { hasAccess: boolean; reason?: string } | null;
  }>({ checking: false, result: null });

  useEffect(() => {
    leapifyApi.getMe().then((me) => {
      if (me && (me.role === 'admin' || me.role === 'super_admin')) setIsAdmin(true);
    });
  }, []);

  useEffect(() => {
    leapifyApi.getEvents()
      .then((data) => { setClasses(data ?? []); setLoading(false); })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Failed to load classes'); setLoading(false); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme) setSelectedTheme(theme);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerClass ? 'hidden' : '';
    document.documentElement.setAttribute('data-drawer-open', drawerClass ? 'true' : '');
    return () => {
      document.body.style.overflow = '';
      document.documentElement.removeAttribute('data-drawer-open');
    };
  }, [drawerClass]);

  // Reset form access check when drawer opens a new class
  useEffect(() => {
    setFormAccessStatus({ checking: false, result: null });
  }, [drawerClass?.id]);

  const handleCloseDrawer = useCallback(() => setDrawerClass(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleCloseDrawer]);

  const themeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of classes) {
      if (!seen.has(c.theme.path)) seen.set(c.theme.path, c.theme.name);
    }
    return Array.from(seen.entries())
      .sort((a, b) => {
        const aSort = classes.find(c => c.theme.path === a[0])?.theme.sortOrder ?? 0;
        const bSort = classes.find(c => c.theme.path === b[0])?.theme.sortOrder ?? 0;
        return aSort - bSort;
      })
      .map(([value, label]) => ({ value, label }));
  }, [classes]);

  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    return classes
      .filter((c) => { if (seen.has(c.date)) return false; seen.add(c.date); return true; })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((c) => ({ value: c.date, label: c.date }));
  }, [classes]);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (selectedTheme && c.theme.path !== selectedTheme) return false;
      if (selectedDate && c.date !== selectedDate) return false;
      return true;
    });
  }, [classes, selectedTheme, selectedDate]);

  const hasFilters = selectedTheme || selectedDate;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '4rem 0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
        <Loader2 size={20} strokeWidth={1.75} style={{ animation: 'faqSpin 0.8s linear infinite' }} />
        Loading classes...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ color: 'rgba(255,100,100,0.7)', fontSize: '0.9rem', margin: '0 0 1rem' }}>{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); leapifyApi.getEvents().then((d) => { setClasses(d ?? []); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); }); }}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
        >Retry</button>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <section className="classes-filters">
        <div className="filter-group">
          <FilterDropdown label="Subtheme" options={themeOptions} value={selectedTheme} onChange={setSelectedTheme} />
          <FilterDropdown label="Date" options={dateOptions} value={selectedDate} onChange={setSelectedDate} />
          {hasFilters && (
            <button className="clear-btn" onClick={() => { setSelectedTheme(null); setSelectedDate(null); }}>
              Clear Filters
            </button>
          )}
        </div>
      </section>

      <section className="classes-results">
        {filtered.length === 0 ? (
          <p className="no-results">No classes match your filters.</p>
        ) : (
          <>
            <p className="results-count">{filtered.length} class{filtered.length !== 1 ? 'es' : ''} found</p>
            <div className="classes-grid">
              {filtered.map((c) => (
                <article key={c.id} className="class-card">
                  <div className="class-card-img">
                    {c.backgroundImageUrl
                      ? <img src={c.backgroundImageUrl} alt={c.title} loading="lazy" />
                      : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)' }} />
                    }
                  </div>
                  <div className="class-card-body">
                    <div className="class-card-header">
                      <span className="class-theme-tag">{c.theme.name}</span>
                      <span className="class-day-tag">{c.date.replace('June ', 'Jun ')}</span>
                    </div>
                    <h3 className="class-title">{c.title}</h3>
                    <div className="class-meta">
                      <div className="class-meta-row">
                        <span className="meta-label">Time</span>
                        <span className="meta-val">{c.startTime} – {c.endTime}</span>
                      </div>
                      <div className="class-meta-row">
                        <span className="meta-label">Venue</span>
                        <span className="meta-val">{c.venue}</span>
                      </div>
                      <div className="class-meta-row">
                        <span className="meta-label">By</span>
                        <span className="meta-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <OrgLogo logoUrl={c.organization.logoUrl} acronym={c.organization.acronym} />
                          {c.organization.acronym}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="class-footer">
                    <span className="slots-badge green">
                      {c.maxSlots === 0 ? 'Open Slots' : `${c.maxSlots} Slots`}
                    </span>
                    <button className="viewmore-btn" onClick={() => setDrawerClass(c)}>View More</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {drawerClass && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCloseDrawer(); }}>
          <div className="drawer">
            <button className="drawer-close" onClick={handleCloseDrawer} aria-label="Close">&times;</button>
            <div className="drawer-img">
              {drawerClass.backgroundImageUrl
                ? <img src={drawerClass.backgroundImageUrl} alt={drawerClass.title} />
                : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)' }} />
              }
            </div>
            <div className="drawer-body">
              <div className="drawer-tags">
                <span className="class-theme-tag">{drawerClass.theme.name}</span>
                <span className="class-day-tag">{drawerClass.date}</span>
                {drawerClass.isSpotlight && (
                  <span className="class-theme-tag" style={{ background: 'rgba(250,225,133,0.15)', color: '#fae185', borderColor: 'rgba(250,225,133,0.3)' }}>★ Main Event</span>
                )}
              </div>
              <h2 className="drawer-title">{drawerClass.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <OrgLogo logoUrl={drawerClass.organization.logoUrl} acronym={drawerClass.organization.acronym} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  {drawerClass.organization.name}
                </span>
              </div>
              <div className="drawer-meta">
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Code</span>
                  <span className="drawer-meta-val">{drawerClass.classCode}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Date</span>
                  <span className="drawer-meta-val">{drawerClass.date}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Time</span>
                  <span className="drawer-meta-val">{drawerClass.startTime} – {drawerClass.endTime}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Venue</span>
                  <span className="drawer-meta-val">{drawerClass.venue}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Slots</span>
                  <span className="drawer-meta-val">{drawerClass.maxSlots === 0 ? 'Unlimited' : drawerClass.maxSlots}</span>
                </div>
              </div>
              <p className="drawer-desc">{drawerClass.description}</p>
              {drawerClass.gformsUrl ? (
                <a
                  href={drawerClass.gformsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-enroll"
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Register Now
                </a>
              ) : (
                <button className="drawer-enroll" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  Registration Unavailable
                </button>
              )}
              {isAdmin && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    onClick={async () => {
                      setFormAccessStatus({ checking: true, result: null });
                      try {
                        const result = await leapifyApi.checkFormAccess(drawerClass.slug);
                        setFormAccessStatus({ checking: false, result });
                      } catch (e) {
                        setFormAccessStatus({ checking: false, result: { hasAccess: false, reason: e instanceof Error ? e.message : 'Request failed' } });
                      }
                    }}
                    disabled={formAccessStatus.checking}
                    style={{
                      width: '100%', padding: '0.55rem 1rem',
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                      borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                      cursor: formAccessStatus.checking ? 'wait' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {formAccessStatus.checking ? 'Checking…' : '🔑 Check Form Access'}
                  </button>
                  {formAccessStatus.result && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: 10,
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', lineHeight: 1.5,
                      background: formAccessStatus.result.hasAccess
                        ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${formAccessStatus.result.hasAccess ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      color: formAccessStatus.result.hasAccess ? '#34d399' : '#f87171',
                    }}>
                      {formAccessStatus.result.hasAccess
                        ? '✓ Service account has access to this form'
                        : `✗ ${formAccessStatus.result.reason ?? 'No access'}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
