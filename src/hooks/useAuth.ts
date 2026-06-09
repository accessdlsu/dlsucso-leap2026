import { useState, useEffect } from 'react';
import { restoreSession, signOut as authSignOut, getToken } from '../services/auth';
import { leapifyApi } from '../services/leapify';
import type { UserProfile } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const profile = await restoreSession();
        if (cancelled) return;

        if (profile) {
          setUser(profile);
          const token = await getToken();
          leapifyApi.setToken(token);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Auth init error:', err);
          setError(err instanceof Error ? err.message : 'Auth error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(init, { timeout: 1500 });
    } else {
      setTimeout(init, 200);
    }

    return () => { cancelled = true; };
  }, []);

  const handleSignOut = async () => {
    try {
      setError(null);
      await authSignOut();
      leapifyApi.setToken(null);
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      console.error('Sign out error:', err);
    }
  };

  return { user, loading, error, handleSignOut };
}
