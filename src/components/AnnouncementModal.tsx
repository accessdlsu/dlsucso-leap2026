import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { leapifyApi } from '../services/leapify';
import type { Announcement } from '../services/leapify';
import { SUPPORTED_LOCALES, setStoredLocale } from '../lib/locale';
import { useLocale } from '../hooks/useLocale';
import { useSiteEnded } from '../hooks/useSiteEnded';

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

function ACK_KEY(id: string) { return `leap-ack-${id}`; }

function isAcked(id: string): boolean {
  try { return !!localStorage.getItem(ACK_KEY(id)); } catch { return false; }
}

function ack(id: string): void {
  try { localStorage.setItem(ACK_KEY(id), '1'); } catch {}
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;

function AutoLinkedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'rgba(250,225,133,0.9)',
          textDecoration: 'underline',
          wordBreak: 'break-all',
        }}
      >
        {url}
      </a>
    );
    last = match.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Manila',
  });
}

export default function AnnouncementModal() {
  const siteEnded = useSiteEnded();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { locale, t } = useLocale();

  useEffect(() => {
    setMounted(true);
    // Don't fetch announcements when site is in archive mode
    if (siteEnded) return;
    leapifyApi.getAnnouncements()
      .then(list => {
        const active = list.filter(a => a.isActive);
        setAllAnnouncements(active);
        // Only show unacknowledged active announcements
        const pending = active.filter(a => !isAcked(a.id));
        setAnnouncements(pending);
      })
      .catch(() => {});
  }, [siteEnded]);

  useEffect(() => {
    const handler = () => {
      if (allAnnouncements.length > 0) {
        setAnnouncements(allAnnouncements);
        setIdx(0);
      }
    };
    window.addEventListener('leap:open-announcements', handler);
    return () => window.removeEventListener('leap:open-announcements', handler);
  }, [allAnnouncements]);

  const current = announcements[idx] ?? null;

  const getContent = useCallback((a: Announcement) => {
    return a.content[locale] ?? a.content['en'] ?? Object.values(a.content)[0] ?? { title: '', body: '' };
  }, [locale]);

  const handleAck = useCallback(() => {
    if (!current) return;
    ack(current.id);
    const next = announcements.filter((_, i) => i !== idx);
    setAnnouncements(next);
    setIdx(i => Math.min(i, next.length - 1));
  }, [current, announcements, idx]);

  const handleDismiss = useCallback(() => {
    if (!current) return;
    // Non-requiresAck: session dismiss only
    if (!current.requiresAck) {
      try { sessionStorage.setItem(ACK_KEY(current.id), '1'); } catch {}
    } else {
      ack(current.id);
    }
    const next = announcements.filter((_, i) => i !== idx);
    setAnnouncements(next);
    setIdx(i => Math.min(i, next.length - 1));
  }, [current, announcements, idx]);

  const handleLocaleChange = useCallback((code: string) => {
    setStoredLocale(code as import('../lib/locale').LocaleCode);
  }, []);

  if (!mounted || !current) return null;

  const content = getContent(current);
  const isRTL = RTL_LOCALES.has(locale);
  const total = announcements.length;
  const availableLocales = SUPPORTED_LOCALES.filter(l => current.content[l.code]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ann-title"
      aria-describedby="ann-body"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(var(--blur-sm, 0px))',
          WebkitBackdropFilter: 'blur(var(--blur-sm, 0px))',
        }}
        aria-hidden="true"
        onClick={current.requiresAck ? undefined : handleDismiss}
      />

      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(10,18,32,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          width: '100%', maxWidth: 520,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          {/* Locale switcher */}
          {availableLocales.length > 1 && (
            <div
              role="tablist"
              aria-label={t('language_label')}
              style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}
            >
              {availableLocales.map(l => (
                <button
                  key={l.code}
                  role="tab"
                  aria-selected={locale === l.code}
                  onClick={() => handleLocaleChange(l.code)}
                  style={{
                    padding: '2px 9px',
                    borderRadius: 9999,
                    border: `1px solid ${locale === l.code ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                    background: locale === l.code ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: locale === l.code ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              {/* Date */}
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.35)', marginBottom: 4,
              }}>
                {formatDate(current.createdAt)}
              </div>
              <h2
                id="ann-title"
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  fontSize: '0.98rem', color: 'rgba(255,255,255,0.95)', margin: 0, lineHeight: 1.35,
                }}
              >
                {content.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          id="ann-body"
          style={{
            padding: '14px 18px', overflowY: 'auto', flexGrow: 1,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          }}
        >
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem',
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            <AutoLinkedText text={content.body} />
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, flexShrink: 0,
        }}>
          {/* Pagination */}
          {total > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                disabled={idx === 0}
                aria-label={t('prev_announcement')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 9999, color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                  cursor: idx === 0 ? 'default' : 'pointer', padding: '4px 8px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
              }}>
                {t('announcement_n_of_m', { n: idx + 1, m: total })}
              </span>
              <button
                onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
                disabled={idx === total - 1}
                aria-label={t('next_announcement')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 9999, color: idx === total - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                  cursor: idx === total - 1 ? 'default' : 'pointer', padding: '4px 8px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)',
            }} />
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {!current.requiresAck && (
              <button
                onClick={handleDismiss}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 9999, padding: '7px 16px', color: 'rgba(255,255,255,0.5)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                }}
              >
                {t('dismiss')}
              </button>
            )}
            <button
              onClick={handleAck}
              aria-label={current.requiresAck ? t('i_understand') : t('continue_btn')}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 9999, padding: '7px 20px', color: '#fff',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {current.requiresAck ? t('i_understand') : t('continue_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
