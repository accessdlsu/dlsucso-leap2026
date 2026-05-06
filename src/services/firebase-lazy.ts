// Lazy-loaded Firebase services — only imported after auth
let _db: any = null;
let _storage: any = null;

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
    const { getStorage } = await import('firebase/storage');
    const { app } = await import('./firebase');
    _storage = getStorage(app);
  }
  return _storage;
}