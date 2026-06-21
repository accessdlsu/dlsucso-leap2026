import { useState, useEffect, useCallback } from 'react';
import { getLocale, subscribeLocale, type LocaleCode } from '../lib/locale';
import { t as tFn, type StringKey } from '../lib/i18n';

export function useLocale() {
  // Use a counter to force re-renders; actual locale comes from the singleton
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Subscribe to locale changes from any island
    return subscribeLocale(() => forceUpdate(n => n + 1));
  }, []);

  const locale = getLocale();

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => tFn(locale, key, vars),
    [locale],
  );

  return { locale, t };
}
