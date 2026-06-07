import { useState, useEffect, useRef } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuthModule } from '../services/firebase';
import type { UserProfile } from '../types';

/**
 * Hook to manage authentication state and user profile.
 * Lazy-loads firebase/auth via getAuthModule() so it stays out of the main bundle.
 */
export function useAuth(): {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  handleSignOut: () => Promise<void>;
} {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoggedProfilePermissionIssue = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      getAuthModule().then(({ auth, onAuthStateChanged }) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(auth, (authUser: FirebaseUser | null) => {
          void (async () => {
            try {
              setUser(authUser);

              if (authUser) {
                try {
                  const { doc, getDocFromServer, setDoc } = await import('firebase/firestore');
                  const { getDb } = await import('../services/firebase-lazy');
                  const db = await getDb();
                  const profileDocRef = doc(db, 'users', authUser.uid);
                  const profileSnapshot = await getDocFromServer(profileDocRef);

                  if (profileSnapshot.exists()) {
                    setUserProfile(profileSnapshot.data() as UserProfile);
                  } else {
                    const newProfile: UserProfile = {
                      uid: authUser.uid,
                      email: authUser.email,
                      displayName: authUser.displayName,
                      photoURL: authUser.photoURL,
                      registeredClasses: [],
                    };
                    await setDoc(profileDocRef, newProfile);
                    setUserProfile(newProfile);
                  }
                } catch (err) {
                  if (!hasLoggedProfilePermissionIssue.current) {
                    console.warn('Could not retrieve user profile (likely permission issue):', err);
                    hasLoggedProfilePermissionIssue.current = true;
                  }
                }
              } else {
                setUserProfile(null);
              }
            } catch (err) {
              console.error('Auth error:', err);
              setError(err instanceof Error ? err.message : 'Authentication error');
            } finally {
              setLoading(false);
            }
          })();
        });
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(start, { timeout: 1500 });
    } else {
      setTimeout(start, 200);
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setError(null);
      const { auth, signOut } = await getAuthModule();
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      console.error('Sign out error:', err);
    }
  };

  return { user, userProfile, loading, error, handleSignOut };
}