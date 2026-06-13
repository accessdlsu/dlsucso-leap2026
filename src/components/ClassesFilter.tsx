import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const themes = [
  { slug: 'palayan', name: 'Palayan ng Karunungan' },
  { slug: 'pamilihan', name: 'Pamilihan ng Kakayahan' },
  { slug: 'plaza', name: 'Plaza ng Malikhaing Diwa' },
  { slug: 'dambana', name: 'Dambana ng Pagkakaisa' },
  { slug: 'palaisdaan', name: 'Palaisdaan ng Kalusugan' },
  { slug: 'bahay', name: 'Bahay ng Bayanihan' },
];

const days = [1, 2, 3, 4, 5, 6];

const classes = [
  { id: 1, title: 'Introduction to Filipino Values', theme: 'palayan', day: 1, time: '9:00 AM - 10:30 AM', venue: 'LS 301', instructor: 'Prof. Santos', slots: 30 },
  { id: 2, title: 'Creative Writing Workshop', theme: 'plaza', day: 1, time: '10:00 AM - 12:00 PM', venue: 'LS 205', instructor: 'Dr. Reyes', slots: 25 },
  { id: 3, title: 'Community Organizing 101', theme: 'bahay', day: 1, time: '1:00 PM - 3:00 PM', venue: 'Gonzaga Hall', instructor: 'Mr. Cruz', slots: 40 },
  { id: 4, title: 'Sustainable Gardening', theme: 'palayan', day: 2, time: '8:00 AM - 10:00 AM', venue: 'Organic Garden', instructor: 'Ms. Lopez', slots: 20 },
  { id: 5, title: 'Digital Marketing Skills', theme: 'pamilihan', day: 2, time: '9:00 AM - 11:00 AM', venue: 'LS 405', instructor: 'Mr. Tan', slots: 35 },
  { id: 6, title: 'Yoga and Mindfulness', theme: 'palaisdaan', day: 2, time: '10:00 AM - 11:30 AM', venue: 'Sports Complex', instructor: 'Ms. Garcia', slots: 45 },
  { id: 7, title: 'Traditional Dance Workshop', theme: 'plaza', day: 3, time: '9:00 AM - 11:00 AM', venue: 'Henry Lee Irwin Theater', instructor: 'Prof. Villanueva', slots: 25 },
  { id: 8, title: 'Leadership and Unity', theme: 'dambana', day: 3, time: '1:00 PM - 3:00 PM', venue: 'LS 301', instructor: 'Dr. Mendoza', slots: 30 },
  { id: 9, title: 'Nutrition and Wellness', theme: 'palaisdaan', day: 3, time: '2:00 PM - 4:00 PM', venue: 'LS 205', instructor: 'Ms. Fernandez', slots: 35 },
  { id: 10, title: 'Bayanihan Community Project', theme: 'bahay', day: 4, time: '8:00 AM - 12:00 PM', venue: 'Gonzaga Field', instructor: 'Mr. Ramos', slots: 50 },
  { id: 11, title: 'Public Speaking Mastery', theme: 'pamilihan', day: 4, time: '1:00 PM - 3:00 PM', venue: 'LS 405', instructor: 'Prof. Gomez', slots: 20 },
  { id: 12, title: 'Filipino Heritage Tour', theme: 'dambana', day: 5, time: '9:00 AM - 11:00 AM', venue: 'Museum', instructor: 'Dr. Torres', slots: 25 },
  { id: 13, title: 'Photography Basics', theme: 'plaza', day: 5, time: '1:00 PM - 3:00 PM', venue: 'LS 205', instructor: 'Mr. Lim', slots: 20 },
  { id: 14, title: 'Financial Literacy', theme: 'pamilihan', day: 5, time: '3:00 PM - 5:00 PM', venue: 'LS 405', instructor: 'Ms. Chua', slots: 40 },
  { id: 15, title: 'Meditation and Relaxation', theme: 'palaisdaan', day: 6, time: '8:00 AM - 10:00 AM', venue: 'Sports Complex', instructor: 'Dr. Santos', slots: 30 },
  { id: 16, title: 'Closing Ceremony Prep', theme: 'bahay', day: 6, time: '1:00 PM - 4:00 PM', venue: 'Henry Lee Irwin Theater', instructor: 'Prof. Cruz', slots: 60 },
  { id: 17, title: 'Critical Thinking Seminar', theme: 'palayan', day: 6, time: '9:00 AM - 11:00 AM', venue: 'LS 301', instructor: 'Dr. Bautista', slots: 35 },
  { id: 18, title: 'Interfaith Dialogue', theme: 'dambana', day: 6, time: '2:00 PM - 4:00 PM', venue: 'LS 301', instructor: 'Fr. Reyes', slots: 25 },
];

function FilterDropdown<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
  formatLabel: (v: T) => string;
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
          {selected ? selected.label : `All ${label}`}
        </span>
        <svg className={`dropdown-arrow ${open ? 'open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="filter-dropdown-menu">
          <button className={`filter-dropdown-item ${value === null ? 'active' : ''}`} onClick={() => { onChange(null); setOpen(false); }}>All {label}</button>
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

export default function ClassesFilter() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [drawerClass, setDrawerClass] = useState<typeof classes[number] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme && themes.some((t) => t.slug === theme)) {
      setSelectedTheme(theme);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerClass ? 'hidden' : '';
    document.documentElement.setAttribute('data-drawer-open', drawerClass ? 'true' : '');
    return () => {
      document.body.style.overflow = '';
      document.documentElement.removeAttribute('data-drawer-open');
    };
  }, [drawerClass]);

  const handleCloseDrawer = useCallback(() => setDrawerClass(null), []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCloseDrawer();
  }, [handleCloseDrawer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleCloseDrawer]);

  const filtered = useMemo(() => {
    let result = classes;
    if (selectedTheme) {
      result = result.filter((c) => c.theme === selectedTheme);
    }
    if (selectedDay) {
      result = result.filter((c) => c.day === selectedDay);
    }
    return result;
  }, [selectedTheme, selectedDay]);

  const clearFilters = () => {
    setSelectedTheme(null);
    setSelectedDay(null);
  };

  const hasFilters = selectedTheme || selectedDay;

  const themeOptions = themes.map((t) => ({ value: t.slug, label: t.name }));
  const dayOptions = days.map((d) => ({ value: d, label: `Day ${d}` }));

  return (
    <div className="classes-page">
      <section className="classes-filters">
        <div className="filter-group">
          <FilterDropdown
            label="Subtheme"
            options={themeOptions}
            value={selectedTheme}
            onChange={setSelectedTheme}
            formatLabel={(v) => themes.find((t) => t.slug === v)?.name ?? v}
          />
          <FilterDropdown
            label="Day"
            options={dayOptions}
            value={selectedDay}
            onChange={(v) => setSelectedDay(v)}
            formatLabel={(v) => `Day ${v}`}
          />
          {hasFilters && (
            <button className="clear-btn" onClick={clearFilters}>
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
                    <img src="/tmp/691188401_1293035212930460_4591157215005585726_n.jpg" alt="" loading="lazy" />
                  </div>
                  <div className="class-card-body">
                    <div className="class-card-header">
                      <span className="class-theme-tag">{themes.find((t) => t.slug === c.theme)?.name}</span>
                      <span className="class-day-tag">Day {c.day}</span>
                    </div>
                    <h3 className="class-title">{c.title}</h3>
                    <div className="class-meta">
                      <div className="class-meta-row">
                        <span className="meta-label">Time</span>
                        <span className="meta-val">{c.time}</span>
                      </div>
                      <div className="class-meta-row">
                        <span className="meta-label">Venue</span>
                        <span className="meta-val">{c.venue}</span>
                      </div>
                      <div className="class-meta-row">
                        <span className="meta-label">Instructor</span>
                        <span className="meta-val">{c.instructor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="class-footer">
                    <span className="slots-badge green">{c.slots} / 50 Slots</span>
                    <button className="viewmore-btn" onClick={() => setDrawerClass(c)}>View More</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {drawerClass && (
        <div className="drawer-overlay" onClick={handleOverlayClick}>
          <div className="drawer">
            <button className="drawer-close" onClick={handleCloseDrawer} aria-label="Close">&times;</button>
            <div className="drawer-img">
              <img src="/tmp/691188401_1293035212930460_4591157215005585726_n.jpg" alt="" />
            </div>
            <div className="drawer-body">
              <div className="drawer-tags">
                <span className="class-theme-tag">{themes.find((t) => t.slug === drawerClass.theme)?.name}</span>
                <span className="class-day-tag">Day {drawerClass.day}</span>
              </div>
              <h2 className="drawer-title">{drawerClass.title}</h2>
              <div className="drawer-meta">
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Time</span>
                  <span className="drawer-meta-val">{drawerClass.time}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Venue</span>
                  <span className="drawer-meta-val">{drawerClass.venue}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Instructor</span>
                  <span className="drawer-meta-val">{drawerClass.instructor}</span>
                </div>
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Slots</span>
                  <span className="drawer-meta-val">{drawerClass.slots} / 50</span>
                </div>
              </div>
              <p className="drawer-desc">
                Join {drawerClass.title} for an enriching experience at LEAP 2026.
                This session is part of the {themes.find((t) => t.slug === drawerClass.theme)?.name} subtheme
                and takes place on Day {drawerClass.day}.
              </p>
              <button className="drawer-enroll">Enroll Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
