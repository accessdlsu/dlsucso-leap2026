export const SUPPORTED_LOCALES = [
  { code: 'en',      label: 'English',  short: 'EN' },
  { code: 'fil',     label: 'Filipino', short: 'FIL' },
  { code: 'zh-hans', label: '简体中文',  short: '简' },
  { code: 'zh-hant', label: '繁體中文',  short: '繁' },
  { code: 'ko',      label: '한국어',    short: '한' },
  { code: 'ja',      label: '日本語',    short: '日' },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code'];

export const LOCALE_STORAGE_KEY = 'leap-locale';

const SUPPORTED_CODES = new Set(SUPPORTED_LOCALES.map(l => l.code));

export function detectLocale(): LocaleCode {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const l = lang.toLowerCase();
    if (l.startsWith('fil') || l === 'tl' || l.startsWith('tl-')) return 'fil';
    if (l === 'zh-hans' || l === 'zh-cn' || l === 'zh-sg' || l === 'zh-my') return 'zh-hans';
    if (l === 'zh-hant' || l === 'zh-tw' || l === 'zh-hk' || l === 'zh-mo') return 'zh-hant';
    if (l.startsWith('zh')) return 'zh-hans';
    if (l.startsWith('ko')) return 'ko';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('en')) return 'en';
  }
  return 'en';
}

// ── Module-level singleton store ──────────────────────────────────────────────
// Shared across ALL React islands on the same page (JS modules are singletons
// per realm). This is the reliable way to sync state across client:only islands.

let _locale: LocaleCode = 'en';
const _subscribers = new Set<() => void>();

// Initialize immediately on module load (runs once, before any component mounts)
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_CODES.has(stored as LocaleCode)) {
      _locale = stored as LocaleCode;
    } else {
      _locale = detectLocale();
    }
  } catch {
    _locale = 'en';
  }
}

export function getLocale(): LocaleCode {
  return _locale;
}

export function setStoredLocale(code: LocaleCode): void {
  _locale = code;
  try { localStorage.setItem(LOCALE_STORAGE_KEY, code); } catch {}
  _subscribers.forEach(fn => fn());
}

export function subscribeLocale(fn: () => void): () => void {
  _subscribers.add(fn);
  return () => { _subscribers.delete(fn); };
}

// Keep for backward compat
export function getStoredLocale(): LocaleCode { return _locale; }
