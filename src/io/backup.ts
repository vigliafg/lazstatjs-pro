/**
 * Last-resort copy of the autosave in IndexedDB.
 *
 * localStorage has a ~5 MB budget and can be cleared by the browser; the
 * IndexedDB copy gives the user something to restore from Settings without
 * adding a server. It stores a single "latest" snapshot.
 */
const DB_NAME = 'lazstats-backups';
const DB_VERSION = 1;
const STORE = 'snapshots';
const KEY = 'latest';

interface BackupRecord {
  id: string;
  savedAt: string;
  text: string;
}

const openDatabase = (): Promise<IDBDatabase | null> => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise(resolve => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> => {
  const db = await openDatabase();
  if (!db) return null;
  try {
    return await new Promise<T | null>(resolve => {
      const transaction = db.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => resolve(null);
    });
  } catch {
    db.close();
    return null;
  }
};

export const saveBackup = async (text: string): Promise<boolean> => {
  const record: BackupRecord = { id: KEY, savedAt: new Date().toISOString(), text };
  const result = await withStore('readwrite', store => store.put(record));
  return result !== null;
};

export const loadBackup = async (): Promise<string | null> => {
  const record = await withStore<BackupRecord | undefined>('readonly', store => store.get(KEY));
  return typeof record?.text === 'string' ? record.text : null;
};

export const clearBackup = async (): Promise<void> => {
  await withStore('readwrite', store => store.delete(KEY));
};
