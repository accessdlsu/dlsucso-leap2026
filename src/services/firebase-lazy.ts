import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

// Lazy-loaded Firebase services — only imported after auth
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export async function getDb() {
  if (!_db) {
    const { getFirestore } = await import('firebase/firestore');
    const { app } = await import('./firebase');
    _db = getFirestore(app);
  }
  return _db;
}

export async function getStorage() {
  if (!_storage) {
    const { getStorage: getFirebaseStorage } = await import('firebase/storage');
    const { app } = await import('./firebase');
    _storage = getFirebaseStorage(app);
  }
  return _storage;
}
