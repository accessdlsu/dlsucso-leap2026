import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Search, Bell, LayoutGrid, SortAsc, Clock, Wrench, TrendingUp, Globe } from 'lucide-react';

// Bump this ID whenever a new changelog should re-show for all users
const CHANGELOG_ID = 'feature-drop-2026-06-22-v6';
const SEEN_KEY = `leap-changelog-seen-${CHANGELOG_ID}`;

const CHANGES: {
  icon: React.ReactNode;
  label: string;
  color: string;
  items: string[];
}[] = [
  {
    icon: <LayoutGrid size={14} strokeWidth={2} />,
    label: 'Class Card Redesign',
    color: '#a78bfa',
    items: [
      'Class code moved below Venue — now shown as a text label row (CODE · S1006) instead of a badge',
      'Day number row removed from cards — cleaner layout',
      'Theme tag no longer wraps to a second line — truncates with ellipsis when too long',
      'Divider line between class info and footer removed',
      'Card body padding tightened — less overlap with date and org logo badges',
    ],
  },
  {
    icon: <SortAsc size={14} strokeWidth={2} />,
    label: 'Smarter Sorting',
    color: '#34d399',
    items: [
      'Classes with available slots now appear first',
      'Full and registration-closed classes automatically pushed to the bottom of the list',
    ],
  },
  {
    icon: <Zap size={14} strokeWidth={2} />,
    label: 'Navigation',
    color: '#f97316',
    items: [
      'Desktop navbar links now show icon above label — same compact style as mobile',
      'Navbar pill width capped at 680px — no longer stretches across the full screen',
    ],
  },
  {
    icon: <Bell size={14} strokeWidth={2} />,
    label: 'ACCESS DLSU Page',
    color: '#fbbf24',
    items: [
      'QA Testers now displayed as clean name cards — profile icon and "QA Tester" label removed',
      'Layout matches the Developers section for consistency',
    ],
  },
  {
    icon: <Search size={14} strokeWidth={2} />,
    label: 'Fixes',
    color: '#60a5fa',
    items: [
      '"Your Registered Class" dialog now appears above the class drawer — no longer hidden behind it',
    ],
  },
  {
    icon: <Bell size={14} strokeWidth={2} />,
    label: 'Navigation (v4)',
    color: '#fbbf24',
    items: [
      'Saved Classes bookmark moved to a dedicated icon in the top navigation bar',
      'Faster access to saved classes — no longer buried in the profile menu',
    ],
  },
  {
    icon: <Globe size={14} strokeWidth={2} />,
    label: 'More Languages (v4)',
    color: '#38bdf8',
    items: [
      'Language switcher now visible directly in the navigation bar — no need to open a menu',
      'Switching language now instantly updates page titles and section descriptions too',
      'Class drawer (Code, Theme, Date, Time, Venue, Slots) fully translated',
      'Section titles and descriptions on all pages adapt to your language',
      '"Browse All Classes", "See Details", "View More" — all translated',
      'QA Testers credited on the ACCESS DLSU page with individual cards',
    ],
  },
  {
    icon: <Search size={14} strokeWidth={2} />,
    label: 'Fixes (v3)',
    color: '#60a5fa',
    items: [
      'Classes with a passed registration deadline now correctly show "Reg. Closed"',
      'Enrollment button disabled after registration deadline — no more accidental clicks',
      'FAQ section opens and closes without any lag',
      'Scroll indicator on homepage now tracks the correct section as you scroll',
      'Ended events no longer appear in the Main Events carousel or Main Events page',
      'Homepage sections now center vertically on all screen sizes',
      'Navigating between pages while a gate (Enhancements, Countdown) is active no longer redirects back',
    ],
  },
  {
    icon: <Globe size={14} strokeWidth={2} />,
    label: 'Language Support (v3)',
    color: '#38bdf8',
    items: [
      'The entire UI now adapts to your chosen language — slot labels, filters, buttons, and messages',
      'Switch languages anytime from the profile menu — detected automatically on first visit',
    ],
  },
  {
    icon: <Zap size={14} strokeWidth={2} />,
    label: 'Smoother UI (v2)',
    color: '#f97316',
    items: [
      'Removed unnecessary animations that were slowing down the site',
      'All interactions feel faster — drawers, overlays, and menus respond instantly',
    ],
  },
  {
    icon: <TrendingUp size={14} strokeWidth={2} />,
    label: 'Speed Improvements (v2)',
    color: '#34d399',
    items: [
      'Pages load faster — logos and class images prioritized earlier',
      'Searching and filtering classes feels more responsive',
      'Opening class details is noticeably snappier',
      'Homepage sections now snap and center correctly on desktop',
    ],
  },
  {
    icon: <Wrench size={14} strokeWidth={2} />,
    label: 'Enhancements Page (v1)',
    color: '#a78bfa',
    items: [
      'A new page may appear during scheduled improvements with a live countdown to when the site returns',
    ],
  },
  {
    icon: <Clock size={14} strokeWidth={2} />,
    label: 'Classes Ended Section (v1)',
    color: '#94a3b8',
    items: [
      'Past events now grouped in a collapsible "Classes Ended" section on the Classes page',
      'Search no longer shows ended events in results',
      'Saved classes that have ended appear in a separate "Event Ended" section',
    ],
  },
  {
    icon: <Bell size={14} strokeWidth={2} />,
    label: 'Announcements (v1)',
    color: '#fbbf24',
    items: [
      'Site announcements now appear in one dialog with timestamp and navigation between multiple',
      'Links in announcements are clickable — no need to copy-paste URLs',
      'Each announcement tracked separately — dismissing one keeps others visible',
      'Available in English, Filipino, 简体中文, 繁體中文, 한국어, 日本語',
    ],
  },
];

export default function ChangelogModal() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(SEEN_KEY)) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('leap:open-changelog', handler);
    return () => window.removeEventListener('leap:open-changelog', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1');
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(var(--blur-sm, 0px))',
          WebkitBackdropFilter: 'blur(var(--blur-sm, 0px))',
        }}
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(8,16,28,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          boxShadow: '0 32px 96px rgba(0,0,0,0.7)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '65vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <div style={{
            flex: 1,
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(251,191,36,0.9)',
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 5,
                padding: '2px 7px',
              }}>
                Feature Drop
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.3)',
              }}>
                June 22, 2026 · v6
              </span>
            </div>
            <h2
              id="changelog-title"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                margin: 0,
              }}
            >
              Sunday Feature Drop
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{
          overflowY: 'auto',
          flexGrow: 1,
          padding: '14px 20px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {CHANGES.map(section => (
            <div key={section.label}>
              {/* Section header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: 8,
              }}>
                <span style={{
                  color: section.color,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {section.icon}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: section.color,
                  letterSpacing: '0.02em',
                }}>
                  {section.label}
                </span>
              </div>

              {/* Items */}
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.72)',
                    lineHeight: 1.5,
                  }}>
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: section.color,
                      flexShrink: 0,
                      marginTop: '0.45em',
                      opacity: 0.7,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 12,
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.3)',
          }}>
            Won't show again on this device
          </span>
          <button
            onClick={dismiss}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 9999,
              padding: '8px 22px',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
