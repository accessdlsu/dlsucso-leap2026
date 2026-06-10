import { useState, useEffect } from 'react';
import { restoreSession, signOut as authSignOut } from '../services/auth';
import { leapifyApi } from '../services/leapify';
import { scheduleInit } from '../utils/helpers';
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
        if (!cancelled && profile) {
          setUser(profile);
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

    scheduleInit(init);

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
