import { useState, useEffect, useRef } from 'react';
import { auth, onAuthStateChanged, signOut as firebaseSignOut, doc, db, getDocFromServer, setDoc } from '../services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../types';

/**
 * Hook to manage authentication state and user profile
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
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setUser(authUser);

        if (authUser) {
          try {
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
                role: 'student',
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
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
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
