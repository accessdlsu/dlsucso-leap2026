import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, Search, X, Bookmark } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { LeapEvent, SlotInfo } from '../services/leapify';
import ClassCard, { computeSlotStatus } from './ClassCard';
import { formatTime } from '../services/utils';
import { getCachedProfile } from '../services/auth';

const SLOT_POLL_MS = 5_000;

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




// Map sorted unique dates → Day 1, Day 2, …
function buildDayMap(events: LeapEvent[]): Map<string, number> {
  const sorted = Array.from(new Set(events.map((e) => e.date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  return new Map(sorted.map((d, i) => [d, i + 1]));
}

function OrgLogo({ logoUrl, acronym }: { logoUrl: string | null; acronym: string }) {
  if (!logoUrl) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.55rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          flexShrink: 0,
        }}
      >
        {acronym.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={acronym}
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
      }}
      loading="lazy"
    />
  );
}

function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
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
          {selected ? selected.label : `All ${label}s`}
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
            All {label}s
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
  const [classes, setClasses] = useState<LeapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotsMap, setSlotsMap] = useState<Map<string, SlotInfo>>(new Map());
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [drawerClass, setDrawerClass] = useState<LeapEvent | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => getCachedProfile() !== null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Hide navbar when drawer is open
  useEffect(() => {
    document.body.classList.toggle('drawer-open', !!drawerClass);
    return () => { document.body.classList.remove('drawer-open'); };
  }, [drawerClass]);

  useEffect(() => {
    leapifyApi
      .getEvents()
      .then((data) => {
        setClasses(data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load classes');
        setLoading(false);
      });
  }, []);

  // Fetch + poll slot availability
  useEffect(() => {
    if (classes.length === 0) return;
    let cancelled = false;

    const fetchSlots = async () => {
      const results = await Promise.allSettled(
        classes.map((c) => leapifyApi.getSlots(c.slug)),
      );
      if (cancelled) return;
      const map = new Map<string, SlotInfo>();
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) map.set(classes[i].id, r.value);
      });
      setSlotsMap(map);
    };

    fetchSlots();
    const timer = setInterval(fetchSlots, SLOT_POLL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [classes]);

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

  const dayMap = useMemo(() => buildDayMap(classes), [classes]);

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


  // Track login state via localStorage (restoreSession writes profile there)
  useEffect(() => {
    const check = () => setIsLoggedIn(getCachedProfile() !== null);
    window.addEventListener('storage', check);
    window.addEventListener('leapify-auth-change', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('leapify-auth-change', check);
    };
  }, []);

  // Fetch bookmarks once when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    leapifyApi.getBookmarks().then(bms => {
      setBookmarkedIds(new Set(bms.map(b => b.event.id)));
    }).catch(() => {});
  }, [isLoggedIn]);

  // Reconcile + re-fetch slots when drawer opens
  useEffect(() => {
    if (!drawerClass) return;
    leapifyApi.reconcileSlots(drawerClass.slug).then((si) => {
      if (si) setSlotsMap(prev => new Map(prev).set(drawerClass.id, si));
    }).catch(() => {});
  }, [drawerClass?.id]);

  const handleBookmarkToggle = useCallback(async (eventId: string) => {
    if (!isLoggedIn || bookmarkPending) return;
    const wasBookmarked = bookmarkedIds.has(eventId);
    setBookmarkedIds(prev => { const n = new Set(prev); wasBookmarked ? n.delete(eventId) : n.add(eventId); return n; });
    setBookmarkPending(eventId);
    try {
      const result = await leapifyApi.toggleBookmark(eventId);
      setBookmarkedIds(prev => { const n = new Set(prev); result.bookmarked ? n.add(eventId) : n.delete(eventId); return n; });
    } catch (err) {
      console.error("[ClassesFilter] Failed to toggle bookmark:", err);
      setBookmarkedIds(prev => { const n = new Set(prev); wasBookmarked ? n.add(eventId) : n.delete(eventId); return n; });
    } finally {
      setBookmarkPending(null);
    }
  }, [isLoggedIn, bookmarkedIds, bookmarkPending]);

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
    const seen = new Set<string>();
    return classes
      .filter((c) => {
        if (seen.has(c.date)) return false;
        seen.add(c.date);
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((c) => {
        const dayNum = dayMap.get(c.date);
        return {
          value: c.date,
          label: dayNum != null ? `${c.date} (Day ${dayNum})` : c.date,
        };
      });
  }, [classes, dayMap]);

  const orgOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of classes) {
      if (!seen.has(c.organization.acronym)) seen.set(c.organization.acronym, c.organization.name);
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, label]) => ({ value, label }));
  }, [classes]);

  const availabilityOptions = useMemo(
    () => [
      { value: 'available', label: 'Available' },
      { value: 'limited', label: 'Limited' },
      { value: 'full', label: 'Full' },
    ],
    [],
  );

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (selectedTheme && c.theme.path !== selectedTheme) return false;
      if (selectedDate && c.date !== selectedDate) return false;
      if (selectedOrg && c.organization.acronym !== selectedOrg) return false;
      if (selectedAvailability) {
        const status = computeSlotStatus(c, slotsMap.get(c.id));
        const normalised = status === 'unlimited' ? 'available' : status;
        if (normalised !== selectedAvailability) return false;
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
  }, [classes, selectedTheme, selectedDate, selectedOrg, selectedAvailability, slotsMap, q]);

  const hasFilters = !!(selectedTheme || selectedDate || selectedOrg || selectedAvailability || search);

  const clearAll = () => {
    setSelectedTheme(null);
    setSelectedDate(null);
    setSelectedOrg(null);
    setSelectedAvailability(null);
    setSearch('');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '4rem 0',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <Loader2
          size={20}
          strokeWidth={1.75}
          style={{ animation: 'faqSpin 0.8s linear infinite' }}
        />
        Loading classes...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ textAlign: 'center', padding: '4rem 0', fontFamily: "'DM Sans', sans-serif" }}
      >
        <p style={{ color: 'rgba(255,100,100,0.7)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
          {error}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            leapifyApi
              .getEvents()
              .then((d) => {
                setClasses(d ?? []);
                setLoading(false);
              })
              .catch((e) => {
                setError(e.message);
                setLoading(false);
              });
          }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '0.5rem 1.25rem',
            borderRadius: 9999,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

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
            options={availabilityOptions}
            value={selectedAvailability}
            onChange={setSelectedAvailability}
          />
          {hasFilters && (
            <button className="clear-btn" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>
      </section>

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
              {filtered.map((c) => (
                <ClassCard
                  key={c.id}
                  event={c}
                  slotInfo={slotsMap.get(c.id)}
                  dayNumber={dayMap.get(c.date)}
                  onAction={() => setDrawerClass(c)}
                  actionLabel="View More"
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Drawer */}
      {drawerClass && (
        <div
          className="drawer-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDrawer();
          }}
        >
          <div className="drawer">
            <button className="drawer-close" onClick={handleCloseDrawer} aria-label="Close">
              &times;
            </button>
            {/* Hero: poster left, header right */}
            <div className="drawer-hero">
              <div className="drawer-poster">
                {drawerClass.backgroundImageUrl ? (
                  <img src={drawerClass.backgroundImageUrl} alt={drawerClass.title} />
                ) : (
                  <div className="drawer-poster-placeholder" />
                )}
              </div>
              <div className="drawer-header">
                <div className="drawer-tags">
                  <span className="class-theme-tag">{drawerClass.theme.name}</span>
                  {drawerClass.isSpotlight && (
                    <span
                      className="class-theme-tag"
                      style={{
                        background: 'rgba(250,225,133,0.15)',
                        color: '#fae185',
                        borderColor: 'rgba(250,225,133,0.3)',
                      }}
                    >
                      ★ Main Event
                    </span>
                  )}
                </div>
                <h2 className="drawer-title">{drawerClass.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                  <OrgLogo
                    logoUrl={drawerClass.organization.logoUrl}
                    acronym={drawerClass.organization.acronym}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.5)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {drawerClass.organization.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable body — meta + description */}
            <div className="drawer-body">
              <div className="drawer-meta">
                {drawerClass.classCode && (
                  <div className="drawer-meta-row">
                    <span className="drawer-meta-label">Code</span>
                    <span className="drawer-meta-val">{drawerClass.classCode}</span>
                  </div>
                )}
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Theme</span>
                  <span className="drawer-meta-val">{drawerClass.theme.name}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Date</span>
                  <span className="drawer-meta-val">
                    {drawerClass.date}
                    {dayMap.get(drawerClass.date) != null
                      ? ` (Day ${dayMap.get(drawerClass.date)})`
                      : ''}
                  </span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Time</span>
                  <span className="drawer-meta-val">
                    {formatTime(drawerClass.startTime)} – {formatTime(drawerClass.endTime)}
                  </span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Venue</span>
                  <span className="drawer-meta-val">{drawerClass.venue}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Slots</span>
                  <span className="drawer-meta-val">
                    {(() => {
                      const si = slotsMap.get(drawerClass.id);
                      if (!si) return drawerClass.maxSlots === 0 ? 'Unlimited' : `${drawerClass.maxSlots} Slots`;
                      if (si.total === 0) return 'Unlimited';
                      return `${si.total - si.registered}/${si.total} Slots Left`;
                    })()}
                  </span>
                </div>
              </div>
              <p className="drawer-desc">{drawerClass.description}</p>
            </div>

            {/* Pinned footer — bookmark + register */}
            <div className="drawer-footer">
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                {isLoggedIn && (
                  <button
                    className="drawer-bookmark-btn"
                    onClick={() => handleBookmarkToggle(drawerClass.id)}
                    disabled={bookmarkPending === drawerClass.id}
                    aria-label={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
                    title={bookmarkedIds.has(drawerClass.id) ? 'Unsave class' : 'Save class'}
                  >
                    <Bookmark
                      size={18}
                      strokeWidth={1.75}
                      fill={bookmarkedIds.has(drawerClass.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {(() => {
                    const si = slotsMap.get(drawerClass.id);
                    const status = computeSlotStatus(drawerClass, si);
                    if (status === 'full') {
                      return (
                        <button
                          className="drawer-enroll"
                          disabled
                          style={{
                            opacity: 0.6,
                            cursor: 'not-allowed',
                            background: 'rgba(180,40,40,0.35)',
                            border: '1px solid rgba(255,136,136,0.25)',
                          }}
                        >
                          Class Full
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
                        >
                          Register Now
                          {status === 'limited' && si && (
                            <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.75 }}>
                              ({si.total - si.registered} left)
                            </span>
                          )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
