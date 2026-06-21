import { useState, useEffect, useMemo, useRef, useCallback, type CSSProperties } from 'react';
import { useLocale } from '../hooks/useLocale';
import { createPortal } from 'react-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent } from '../services/leapify';
import { useAllEvents } from '../hooks/useAllEvents';
import { computeSlotStatus } from './ClassCard';
import OrgLogo from './OrgLogo';
import { buildStaticDayMap, LEAP_DAYS } from '../constants/leapDays';

interface FilterProps {
  label: string;
  allLabel?: string;
  value: string | null;
  options: { value: string; label: string; sub?: string }[];
  onChange: (v: string | null) => void;
}

function OverlayFilter({ label, allLabel, value, options, onChange }: FilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const trigger: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 9999,
    background: value ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${value ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)'}`,
    color: value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  };

  const menu: CSSProperties = {
    position: 'absolute', top: '100%', left: 0, marginTop: 6,
    minWidth: 200, maxHeight: 220, overflowY: 'auto',
    background: 'rgba(8,14,24,0.96)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    zIndex: 2100, padding: '4px 0',
    scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  };

  const item = (active: boolean): CSSProperties => ({
    display: 'block', width: '100%', padding: '8px 14px',
    background: active ? 'rgba(255,255,255,0.1)' : 'none', border: 'none',
    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
    cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
  });

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button style={trigger} onClick={() => setOpen(o => !o)}>
        <span>{selected ? `${label}: ${selected.sub ?? selected.label}` : label}</span>
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {value && (
          <span
            onClick={e => { e.stopPropagation(); onChange(null); }}
            style={{ marginLeft: 2, opacity: 0.55, fontSize: '1rem', lineHeight: 1, cursor: 'pointer' }}
          >×</span>
        )}
      </button>
      {open && (
        <div style={menu}>
          <button style={item(value === null)} onClick={() => { onChange(null); setOpen(false); }}>
            {allLabel ?? `All ${label}s`}
          </button>
          {options.map(opt => (
            <button key={opt.value} style={{ ...item(value === opt.value), display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              onMouseEnter={e => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <span>{opt.label}</span>
              {opt.sub && (
                <span style={{ marginLeft: 'auto', paddingLeft: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                  {opt.sub}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const events = useAllEvents();
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedAvail, setSelectedAvail] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availOptions = useMemo(() => [
    { value: 'open', label: t('avail_open') },
    { value: 'full', label: t('avail_full') },
  ], [t]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedTheme(null);
      setSelectedDate(null);
      setSelectedOrg(null);
      setSelectedAvail(null);
      document.body.classList.remove('search-open');
      return;
    }
    document.body.classList.add('search-open');
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('search-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const dayMap = useMemo(() => buildStaticDayMap(), []);

  const themeOptions = useMemo(() => {
    const seen = new Map<string, { name: string; order: number }>();
    for (const c of events) {
      if (!seen.has(c.theme.path)) seen.set(c.theme.path, { name: c.theme.name, order: c.theme.sortOrder });
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[1].order - b[1].order)
      .map(([value, { name }]) => ({ value, label: name }));
  }, [events]);

  const dateOptions = useMemo(() => {
    // Use static LEAP_DAYS as the source of truth
    const classDateSet = new Set(events.map(c => c.date));
    return LEAP_DAYS
      .filter(day => classDateSet.has(day.date))
      .map(day => ({
        value: day.date,
        label: `${day.date} (Day ${day.num})`,
      }));
  }, [events]);

  const orgOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of events) {
      if (!seen.has(c.organization.acronym)) seen.set(c.organization.acronym, c.organization.name);
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, label]) => ({ value, label, sub: value }));
  }, [events]);

  const q = query.trim().toLowerCase();
  const hasFilter = !!(q || selectedTheme || selectedDate || selectedOrg || selectedAvail);

  // Manila midnight today in ms for ended detection
  const manilaToday = useMemo(() => {
    const d = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    return new Date(d + 'T00:00:00+08:00').getTime();
  }, []);

  // If already on /classes, dispatch a custom event instead of navigating
  const handleResultClick = useCallback((e: React.MouseEvent, ev?: LeapEvent) => {
    if (window.location.pathname === '/classes') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('search-overlay:navigate', {
        detail: {
          search: ev ? ev.title : q,
          theme: selectedTheme,
          date: selectedDate,
          org: selectedOrg,
        },
      }));
    }
    // Always close the overlay
    onClose();
  }, [q, selectedTheme, selectedDate, selectedOrg, onClose]);

  const filtered = useMemo(() => {
    if (!hasFilter) return [];
    return events.filter(c => {
      if (c.date && new Date(c.date).getTime() < manilaToday) return false; // exclude ended events
      if (selectedTheme && c.theme.path !== selectedTheme) return false;
      if (selectedDate && c.date !== selectedDate) return false;
      if (selectedOrg && c.organization.acronym !== selectedOrg) return false;
      if (selectedAvail) {
        const isFull = computeSlotStatus(c) === 'full';
        const isRegClosed = c.registrationEnabled === false || (c.registrationClosesAt != null && c.registrationClosesAt * 1000 < Date.now());
        if (selectedAvail === 'full' && !isFull && !isRegClosed) return false;
        if (selectedAvail === 'open' && (isFull || isRegClosed)) return false;
      }
      if (q) {
        const hay = [c.title, c.classCode, c.organization.name, c.organization.acronym, c.venue, c.theme.name]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, q, selectedTheme, selectedDate, selectedOrg, selectedAvail, hasFilter, manilaToday]);

  const classesHref = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('search', q);
    if (selectedTheme) p.set('theme', selectedTheme);
    if (selectedOrg) p.set('org', selectedOrg);
    if (selectedDate) {
      const day = dayMap.get(selectedDate);
      if (day) p.set('day', String(day));
    }
    const qs = p.toString();
    return `/classes${qs ? `?${qs}` : ''}`;
  }, [q, selectedTheme, selectedDate, selectedOrg, dayMap]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
      {/* Backdrop: position:absolute so it doesn't create a stacking context above the panel */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Panel + results: position:relative so dropdowns float above results */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Glass search + filter panel */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(8,14,24,0.90)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '18px 20px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            animation: 'searchSlideIn 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Search row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={18} strokeWidth={1.75} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('search_classes_placeholder')}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 500,
                color: '#fff', caretColor: '#7ec8a0', minWidth: 0,
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <X size={16} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9999, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                padding: '5px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, whiteSpace: 'nowrap',
              }}
            >
              <X size={12} strokeWidth={2} /> {t('close')}
            </button>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <OverlayFilter label={t('filter_subtheme')} value={selectedTheme} options={themeOptions} onChange={setSelectedTheme} />
            <OverlayFilter label={t('filter_date')} value={selectedDate} options={dateOptions} onChange={setSelectedDate} />
            <OverlayFilter label={t('filter_org')} value={selectedOrg} options={orgOptions} onChange={setSelectedOrg} />
            <OverlayFilter label={t('filter_avail')} allLabel={t('filter_avail_all')} value={selectedAvail} options={availOptions} onChange={setSelectedAvail} />
          </div>
        </div>

        {/* Results panel */}
        {hasFilter && (
          <div
            style={{
              position: 'relative', zIndex: 0,
              maxHeight: '55vh', overflowY: 'auto',
              background: 'rgba(6,12,22,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent',
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                {t('no_search_results')}
              </div>
            ) : (
              <>
                {filtered.map(ev => (
                  <a
                    key={ev.id}
                    href={`/classes?search=${encodeURIComponent(ev.title)}`}
                    onClick={(e) => handleResultClick(e, ev)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '22.37%', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <OrgLogo logoUrl={ev.organization.logoUrl} acronym={ev.organization.acronym} size={36} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                        {ev.organization.name} · {ev.theme.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap' }}>
                        {ev.date}{dayMap.get(ev.date) != null ? ` (Day ${dayMap.get(ev.date)})` : ''}
                      </span>
                      {ev.classCode && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.64rem', color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.04em' }}>
                          {ev.classCode}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
                <a
                  href={classesHref}
                  onClick={(e) => handleResultClick(e)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '13px 20px', textDecoration: 'none', position: 'sticky', bottom: 0,
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
                    color: 'rgba(255,255,255,0.45)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(6,12,22,0.98)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)')}
                >
                  {filtered.length === 1 ? t('see_all_results', { n: filtered.length }) : t('see_all_results_plural', { n: filtered.length })}
                  <ArrowRight size={13} strokeWidth={2} />
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
