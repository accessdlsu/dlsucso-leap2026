import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X, Bookmark } from 'lucide-react';
import { useProgressiveRender } from '../hooks/useProgressiveRender';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent, SlotInfo, MyRegistration } from '../services/leapify';
import { useAllSlots } from '../hooks/useAllSlots';
import { useAllEvents } from '../hooks/useAllEvents';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { SkeletonGrid } from './skeletons';
import { formatTime } from '../services/utils';
import { buildStaticDayMap, LEAP_DAYS } from '../constants/leapDays';
import { useBookmarks } from '../hooks/useBookmarks';
import OrgLogo from './OrgLogo';
import ClassDrawer from './ClassDrawer';


const SUBTHEME_DETAILS: Record<string, {
  name: string;
  img: string;
  color: string;
  desc: string;
  quote: string;
}> = {
  'palayan': {
    name: 'Palayan ng Karunungan',
    img: '/images/themes/palay.png',
    color: '#c8e6a0',
    desc: 'In a vast rice field, every grain of knowledge is carefully nurtured. Here, wisdom is planted, watered by curiosity, and harvested as innovation and learning for the future.',
    quote: 'Palawakin ang kaalaman sa pamamagitan ng mga intelektwal na disiplina.'
  },
  'palayan-ng-karunungan': {
    name: 'Palayan ng Karunungan',
    img: '/images/themes/palay.png',
    color: '#c8e6a0',
    desc: 'In a vast rice field, every grain of knowledge is carefully nurtured. Here, wisdom is planted, watered by curiosity, and harvested as innovation and learning for the future.',
    quote: 'Palawakin ang kaalaman sa pamamagitan ng mga intelektwal na disiplina.'
  },
  'bahay': {
    name: 'Bahay ng Bayanihan',
    img: '/images/themes/bahay.png',
    color: '#f0c080',
    desc: 'In a home built by collective strength, trust and cooperation are learned. No challenge is too great when faced together.',
    quote: 'Isabuhay ang diwa ng bayanihan at paglilingkod sa kapwa.'
  },
  'bahay-ng-bayanihan': {
    name: 'Bahay ng Bayanihan',
    img: '/images/themes/bahay.png',
    color: '#f0c080',
    desc: 'In a home built by collective strength, trust and cooperation are learned. No challenge is too great when faced together.',
    quote: 'Isabuhay ang diwa ng bayanihan at paglilingkod sa kapwa.'
  },
  'palaisdaan': {
    name: 'Palaisdaan ng Kalusugan',
    img: '/images/themes/palaisdaan.png',
    color: '#80d4b0',
    desc: 'In a quiet palaisdaan, the gentle waters flow and bring life to the nayon. Here, both body and mind are nurtured, allowing moments of rest and reflection to restore the strength needed to grow, move forward, and serve others.',
    quote: 'Alagaan ang kalusugan sa lahat ng aspeto ng pamumuhay.'
  },
  'palaisdaan-ng-kalusugan': {
    name: 'Palaisdaan ng Kalusugan',
    img: '/images/themes/palaisdaan.png',
    color: '#80d4b0',
    desc: 'In a quiet palaisdaan, the gentle waters flow and bring life to the nayon. Here, both body and mind are nurtured, allowing moments of rest and reflection to restore the strength needed to grow, move forward, and serve others.',
    quote: 'Alagaan ang kalusugan sa lahat ng aspeto ng pamumuhay.'
  },
  'dambana': {
    name: 'Dambana ng Pagkakaisa',
    img: '/images/themes/dambana.png',
    color: '#d4a0e8',
    desc: 'At the village’s core, hands meet, ready to help. Here, compassion is strengthened, and service becomes the foundation of true bayanihan.',
    quote: 'Itatag ang pagkakaisa at ipagdiwang ang pagkakaiba-iba.'
  },
  'dambana-ng-pagkakaisa': {
    name: 'Dambana ng Pagkakaisa',
    img: '/images/themes/dambana.png',
    color: '#d4a0e8',
    desc: 'At the village’s core, hands meet, ready to help. Here, compassion is strengthened, and service becomes the foundation of true bayanihan.',
    quote: 'Itatag ang pagkakaisa at ipagdiwang ang pagkakaiba-iba.'
  },
  'pamilihan': {
    name: 'Pamilihan ng Kakayahan',
    img: '/images/themes/pamilihan.png',
    color: '#ffb68c',
    desc: 'At the heart of the marketplace, people exchange intellect and talent. Every skill has value, and every lesson learned becomes a contribution to the growth of the whole village.',
    quote: 'Palakasin ang kakayahan para sa propesyonal na mundo.'
  },
  'pamilihan-ng-kakayahan': {
    name: 'Pamilihan ng Kakayahan',
    img: '/images/themes/pamilihan.png',
    color: '#ffb68c',
    desc: 'At the heart of the marketplace, people exchange intellect and talent. Every skill has value, and every lesson learned becomes a contribution to the growth of the whole village.',
    quote: 'Palakasin ang kakayahan para sa propesyonal na mundo.'
  },
  'plaza': {
    name: 'Plaza ng Malikhaing Diwa',
    img: '/images/themes/plaza.png',
    color: '#a0d4f0',
    desc: 'In the vibrant plaza, music, color, and stories dance together. Imagination comes alive here, and every creation becomes the voice of the community.',
    quote: 'Pahintulutan ang sariling lumikha sa sining at disenyo.'
  },
  'plaza-ng-malikhaing-diwa': {
    name: 'Plaza ng Malikhaing Diwa',
    img: '/images/themes/plaza.png',
    color: '#a0d4f0',
    desc: 'In the vibrant plaza, music, color, and stories dance together. Imagination comes alive here, and every creation becomes the voice of the community.',
    quote: 'Pahintulutan ang sariling lumikha sa sining at disenyo.'
  }
};




function FilterDropdown<T extends string>({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel?: string;
  options: { value: T; label: string; sub?: string }[];
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
          {selected ? (selected.sub ?? selected.label) : (allLabel ?? `All ${label}s`)}
        </span>
        <svg
          className={`dropdown-arrow ${open ? 'open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="filter-dropdown-menu">
          <button
            className={`filter-dropdown-item ${value === null ? 'active' : ''}`}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            {allLabel ?? `All ${label}s`}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`filter-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {opt.sub && (
                <span
                  style={{
                    marginLeft: 'auto',
                    paddingLeft: '1rem',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 500,
                  }}
                >
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

export default function ClassesFilter() {
  const classes = useAllEvents();
  const loading = classes.length === 0;
  const slotsMap = useAllSlots();
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const { bookmarkedIds, bookmarkPending, handleBookmarkToggle, isLoggedIn } = useBookmarks();
  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [registrationPolling, setRegistrationPolling] = useState(false);
  const [myRegsDialogOpen, setMyRegsDialogOpen] = useState(false);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const registrationPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hide navbar when drawer is open
  useEffect(() => {
    document.body.classList.toggle('drawer-open', !!drawerClass);
    return () => { document.body.classList.remove('drawer-open'); };
  }, [drawerClass]);



  // Listen for search overlay navigation events (when already on /classes)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.search) setSearch(detail.search);
      if (detail.theme) setSelectedTheme(detail.theme);
      if (detail.date) setSelectedDate(detail.date);
      if (detail.org) setSelectedOrg(detail.org);
      // Focus the search input after state updates
      setTimeout(() => searchRef.current?.focus(), 50);
    };
    window.addEventListener('search-overlay:navigate', handler);
    return () => window.removeEventListener('search-overlay:navigate', handler);
  }, []);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    const day = params.get('day');
    const q = params.get('search');
    const org = params.get('org');
    if (theme) setSelectedTheme(theme);
    if (q) setSearch(q);
    if (day) setPendingDay(parseInt(day, 10));
    if (org) setSelectedOrg(org);
  }, []);

  const dayMap = useMemo(() => buildStaticDayMap(), []);

  // Resolve pending ?day= param once classes load
  useEffect(() => {
    if (pendingDay !== null && dayMap.size > 0) {
      const targetDate = Array.from(dayMap.entries()).find(([, n]) => n === pendingDay)?.[0];
      if (targetDate) {
        setSelectedDate(targetDate);
        setPendingDay(null);
      }
    }
  }, [dayMap, pendingDay]);

  useEffect(() => {
    document.body.style.overflow = drawerClass ? 'hidden' : '';
    document.documentElement.setAttribute('data-drawer-open', drawerClass ? 'true' : '');
    return () => {
      document.body.style.overflow = '';
      document.documentElement.removeAttribute('data-drawer-open');
    };
  }, [drawerClass]);


  // Fetch registration status on login
  useEffect(() => {
    if (!isLoggedIn) { setMyRegistrations([]); return; }
    leapifyApi.getMyRegistrations().then(regs => setMyRegistrations(regs ?? []));
  }, [isLoggedIn]);

  // Auto-close dialog if registrations are cleared (e.g. admin removal reflected via 60s poll)
  useEffect(() => {
    if (myRegistrations.length === 0) setMyRegsDialogOpen(false);
  }, [myRegistrations]);

  // Refresh registrations on tab focus (catches admin-side removals without polling)
  useEffect(() => {
    if (!isLoggedIn) return;
    const refresh = () => leapifyApi.getMyRegistrations().then(regs => setMyRegistrations(regs ?? []));
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { document.removeEventListener('visibilitychange', onVisibility); };
  }, [isLoggedIn]);

  // Cleanup poll on unmount
  useEffect(() => {
    return () => { if (registrationPollRef.current) clearInterval(registrationPollRef.current); };
  }, []);

  const handleCloseDrawer = useCallback(() => setDrawerClass(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseDrawer();
    };
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
        const aSort = classes.find((c) => c.theme.path === a[0])?.theme.sortOrder ?? 0;
        const bSort = classes.find((c) => c.theme.path === b[0])?.theme.sortOrder ?? 0;
        return aSort - bSort;
      })
      .map(([value, label]) => ({ value, label }));
  }, [classes]);

  const dateOptions = useMemo(() => {
    // Use static LEAP_DAYS as the source of truth
    const classDateSet = new Set(classes.map(c => c.date));
    return LEAP_DAYS
      .filter(day => classDateSet.has(day.date))
      .map(day => ({
        value: day.date,
        label: `${day.date} (Day ${day.num})`,
      }));
  }, [classes]);

  const orgOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of classes) {
      if (!seen.has(c.organization.acronym)) seen.set(c.organization.acronym, c.organization.name);
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, label]) => ({ value, label, sub: value }));
  }, [classes]);

  const availabilityOptions = useMemo(
    () => [
      { value: 'open', label: 'Open' },
      { value: 'full', label: 'Full' },
    ],
    [],
  );

  const q = search.trim().toLowerCase();
  const todayDate = new Date().toISOString().split('T')[0];
  const hasClassesToday = useMemo(() => classes.some(c => c.date === todayDate), [classes, todayDate]);

  // Conflict detection: bookmarked classes on same day with overlapping times
  const bookmarkConflicts = useMemo(() => {
    const bookmarked = classes.filter(c => bookmarkedIds.has(c.id));
    const conflicts: { a: LeapEvent; b: LeapEvent }[] = [];
    for (let i = 0; i < bookmarked.length; i++) {
      for (let j = i + 1; j < bookmarked.length; j++) {
        const a = bookmarked[i];
        const b = bookmarked[j];
        if (a.date !== b.date) continue;
        // HH:MM strings compare lexicographically correctly
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          conflicts.push({ a, b });
        }
      }
    }
    return conflicts;
  }, [classes, bookmarkedIds]);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (showOnlyBookmarked && !bookmarkedIds.has(c.id)) return false;
      if (selectedTheme && c.theme.path !== selectedTheme) return false;
      if (selectedDate && c.date !== selectedDate) return false;
      if (selectedOrg && c.organization.acronym !== selectedOrg) return false;
      if (selectedAvailability) {
        const status = computeSlotStatus(c, slotsMap.get(c.slug));
        const isFull = status === 'full';
        if (selectedAvailability === 'full' && !isFull) return false;
        if (selectedAvailability === 'open' && isFull) return false;
      }
      if (q) {
        const haystack = [
          c.title,
          c.classCode,
          c.organization.name,
          c.organization.acronym,
          c.venue,
          c.theme.name,
          c.description,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [classes, showOnlyBookmarked, bookmarkedIds, selectedTheme, selectedDate, selectedOrg, selectedAvailability, slotsMap, q]);

  const hasFilters = !!(selectedTheme || selectedDate || selectedOrg || selectedAvailability || search || showOnlyBookmarked);

  // Progressive rendering — mount cards in batches as the user scrolls
  const { visibleCount, sentinelRef, hasMore } = useProgressiveRender(filtered.length);

  const clearAll = () => {
    setSelectedTheme(null);
    setSelectedDate(null);
    setSelectedOrg(null);
    setSelectedAvailability(null);
    setSearch('');
    setShowOnlyBookmarked(false);
  };

  if (loading) {
    return (
      <div className="classes-page">
        {/* Search bar skeleton */}
        <div className="search-bar-wrapper" aria-hidden="true">
          <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0 }} />
          <div className="skeleton" style={{ flex: 1, height: 16, borderRadius: 4 }} />
        </div>
        {/* Filter row skeleton */}
        <section className="classes-filters" aria-hidden="true">
          <div className="filter-group">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton" style={{ width: 140, height: 36, borderRadius: 9999 }} />
            ))}
          </div>
        </section>
        <SkeletonGrid count={8} />
      </div>
    );
  }


  // Drawer footer with complex registration logic
  const drawerFooter = drawerClass && (
    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
      {isLoggedIn && (
        <button
          className="drawer-bookmark-btn"
          onClick={() => handleBookmarkToggle(drawerClass.id)}
          disabled={bookmarkPending === drawerClass.id}
          aria-label={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
          title={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
        >
          <Bookmark size={18} strokeWidth={1.75} fill={bookmarkedIds.has(drawerClass.id) ? 'currentColor' : 'none'} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {(() => {
          const si = slotsMap.get(drawerClass.slug);
          const status = computeSlotStatus(drawerClass, si);
          if (drawerClass.registrationEnabled === false) {
            return (
              <button className="drawer-enroll" disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Registration Closed
              </button>
            );
          }
          if (status === 'full') {
            return (
              <button className="drawer-enroll" disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(180,40,40,0.35)', border: '1px solid rgba(255,136,136,0.25)' }}>
                Class Full
              </button>
            );
          }
          if (myRegistrations.length > 0) {
            return (
              <button className="drawer-enroll" onClick={() => setMyRegsDialogOpen(true)} style={{ background: 'rgba(180,130,0,0.35)', border: '1px solid rgba(255,210,80,0.3)', color: '#ffe480' }}>
                Already Registered — View My Class{myRegistrations.length !== 1 ? 'es' : ''}
              </button>
            );
          }
          if (drawerClass.gformsUrl) {
            return (
              <a
                href={drawerClass.gformsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-enroll"
                onClick={() => {
                  if (registrationPolling || !isLoggedIn) return;
                  setRegistrationPolling(true);
                  const POLL_INTERVAL = 4_000;
                  const POLL_TIMEOUT = 10 * 60 * 1000;
                  const startedAt = Date.now();
                  registrationPollRef.current = setInterval(async () => {
                    const regs = await leapifyApi.getMyRegistrations();
                    if (regs && regs.length > 0) {
                      setMyRegistrations(regs);
                      setRegistrationPolling(false);
                      if (registrationPollRef.current) clearInterval(registrationPollRef.current);
                    } else if (Date.now() - startedAt > POLL_TIMEOUT) {
                      setRegistrationPolling(false);
                      if (registrationPollRef.current) clearInterval(registrationPollRef.current);
                    }
                  }, POLL_INTERVAL);
                }}
              >
                Register Now
                {registrationPolling && <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.6 }}>(checking…)</span>}
                {status === 'limited' && si && !registrationPolling && <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.75 }}>({Math.max(0, (si.total || 0) - (si.registered || 0))} left)</span>}
              </a>
            );
          }
          return (
            <button className="drawer-enroll" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Registration Unavailable
            </button>
          );
        })()}
      </div>
    </div>
  );


  return (
    <div className="classes-page">
      {/* Search bar */}
      <div className="search-bar-wrapper">
        <Search size={16} className="search-icon" strokeWidth={2} />
        <input
          ref={searchRef}
          type="text"
          className="search-input"
          placeholder="Search by title, code, organization, venue…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }} aria-label="Clear search">
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Filters */}
      <section className="classes-filters">
        <div className="filter-group">
          <FilterDropdown
            label="Subtheme"
            options={themeOptions}
            value={selectedTheme}
            onChange={setSelectedTheme}
          />
          <FilterDropdown
            label="Date"
            options={dateOptions}
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <FilterDropdown
            label="Organization"
            options={orgOptions}
            value={selectedOrg}
            onChange={setSelectedOrg}
          />
          <FilterDropdown
            label="Availability"
            allLabel="All Availability"
            options={availabilityOptions}
            value={selectedAvailability}
            onChange={setSelectedAvailability}
          />
          {hasClassesToday && (
            <button
              className="clear-btn"
              onClick={() => setSelectedDate(selectedDate === todayDate ? null : todayDate)}
              style={selectedDate === todayDate ? { background: 'rgba(250,225,133,0.2)', color: '#fae185', borderColor: 'rgba(250,225,133,0.4)' } : {}}
            >
              Today
            </button>
          )}
          {isLoggedIn && (
            <button
              className="clear-btn"
              onClick={() => setShowOnlyBookmarked(v => !v)}
              style={showOnlyBookmarked ? { background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' } : {}}
            >
              Saved{bookmarkedIds.size > 0 ? ` (${bookmarkedIds.size})` : ''}
            </button>
          )}
          {hasFilters && (
            <button className="clear-btn" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* Conflict warning */}
      {bookmarkConflicts.length > 0 && (
        <div style={{
          margin: '0 0 1rem',
          padding: '0.65rem 1rem',
          background: 'rgba(220,100,0,0.15)',
          border: '1px solid rgba(255,160,60,0.3)',
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.78rem',
          color: '#ffb566',
        }}>
          <strong style={{ fontWeight: 700 }}>⚠ Schedule conflict{bookmarkConflicts.length !== 1 ? 's' : ''} in saved classes</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {bookmarkConflicts.map(({ a, b }, i) => (
              <li key={i}>
                <em>{a.title}</em> &amp; <em>{b.title}</em> overlap on {a.date} ({formatTime(a.startTime)}–{formatTime(a.endTime)} vs {formatTime(b.startTime)}–{formatTime(b.endTime)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Subtheme Info Card */}
      {selectedTheme && SUBTHEME_DETAILS[selectedTheme] && (
        <div
          className="subtheme-card"
          style={{ '--subtheme-color': SUBTHEME_DETAILS[selectedTheme].color } as React.CSSProperties}
        >
          <div className="subtheme-card-img-wrapper">
            <img
              src={SUBTHEME_DETAILS[selectedTheme].img}
              alt={SUBTHEME_DETAILS[selectedTheme].name}
              className="subtheme-card-img"
            />
          </div>
          <div className="subtheme-card-content">
            <h2 className="subtheme-card-title">
              {SUBTHEME_DETAILS[selectedTheme].name}
            </h2>
            <p className="subtheme-card-desc">
              {SUBTHEME_DETAILS[selectedTheme].desc}
            </p>
            <p className="subtheme-card-quote">
              &ldquo;{SUBTHEME_DETAILS[selectedTheme].quote}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <section className="classes-results">
        {filtered.length === 0 ? (
          <p className="no-results">No classes match your filters.</p>
        ) : (
          <>
            <p className="results-count">
              {filtered.length} class{filtered.length !== 1 ? 'es' : ''} found
            </p>
            <p className="results-note">More LEAP classes to be announced soon.</p>
            <div className="classes-grid">
              {filtered.slice(0, visibleCount).map((c) => (
                <div key={c.id} style={{ position: 'relative' }}>
                  {myRegistrations.some(r => r.slug === c.slug) && (
                    <div style={{
                      position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                      zIndex: 10, background: 'rgba(42,98,52,0.85)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(139,229,155,0.4)', borderRadius: 9999,
                      padding: '3px 12px', fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.6rem', fontWeight: 700, color: '#8be59b',
                      letterSpacing: '0.06em', whiteSpace: 'nowrap', pointerEvents: 'none',
                    }}>
                      ✓ REGISTERED
                    </div>
                  )}
                  <ClassCard
                    event={c}
                    slotInfo={slotsMap.get(c.slug)}
                    dayNumber={dayMap.get(c.date)}
                    onAction={() => setDrawerClass(c)}
                    actionLabel="View More"
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div ref={sentinelRef} style={{ height: 1 }} />
            )}
          </>
        )}
      </section>

      {/* Drawer */}
      {drawerClass && (
        <ClassDrawer
          event={drawerClass}
          onClose={handleCloseDrawer}
          dayMap={dayMap}
          slotsMap={slotsMap}
          footer={drawerFooter}
        />
      )}

      {/* My Registrations Dialog */}
      {myRegsDialogOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setMyRegsDialogOpen(false)}
        >
          <div
            style={{
              background: 'rgba(18,18,24,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '1.5rem',
              maxWidth: 480,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: "'Poppins', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#ffe480' }}>
                Your Registered Class{myRegistrations.length !== 1 ? 'es' : ''}
              </h3>
              <button
                onClick={() => setMyRegsDialogOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', padding: 4, lineHeight: 1,
                  fontSize: '1.2rem',
                }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}>
              You are already registered for {myRegistrations.length === 1 ? 'a class' : `${myRegistrations.length} classes`}. Registration is limited to one class per student.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myRegistrations.map(reg => {
                const cls = classes.find(c => c.slug === reg.slug);
                return (
                  <div
                    key={reg.eventId}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: '#fff', marginBottom: 4 }}>
                      {cls?.title ?? reg.slug}
                    </div>
                    {cls && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{cls.date}{dayMap.get(cls.date) != null ? ` · Day ${dayMap.get(cls.date)}` : ''}</span>
                        <span>{formatTime(cls.startTime)} – {formatTime(cls.endTime)}</span>
                        <span>{cls.venue}</span>
                      </div>
                    )}
                    <div style={{ marginTop: 6, fontSize: '0.68rem', color: 'rgba(139,229,155,0.8)', fontFamily: "'DM Sans', sans-serif" }}>
                      ✓ Registered {new Date(reg.submittedAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
