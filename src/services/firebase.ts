import { initializeApp } from 'firebase/app';
import type {
  Auth,
  GoogleAuthProvider as IGoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// Lazy auth — only loads firebase/auth chunk when actually needed
let authPromise: Promise<{
  auth: Auth;
  googleProvider: IGoogleAuthProvider;
  signInWithPopup: typeof import('firebase/auth').signInWithPopup;
  signOut: typeof import('firebase/auth').signOut;
  onAuthStateChanged: typeof import('firebase/auth').onAuthStateChanged;
}> | null = null;

export function getAuthModule() {
  if (!authPromise) {
    authPromise = import('firebase/auth').then((mod) => {
      const auth = mod.getAuth(app);
      const googleProvider = new mod.GoogleAuthProvider();
      googleProvider.setCustomParameters({ hd: 'dlsu.edu.ph' });
      return {
        auth,
        googleProvider,
        signInWithPopup: mod.signInWithPopup,
        signOut: mod.signOut,
        onAuthStateChanged: mod.onAuthStateChanged,
      };
    });
  }
  return authPromise;
}

export type { FirebaseUser };