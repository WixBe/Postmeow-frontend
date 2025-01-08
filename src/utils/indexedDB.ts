import { openDB, IDBPDatabase } from 'idb';

interface CachedDocument {
  _id: string;
  data: unknown;
  config: unknown;
  status: number;
  responseTime: number;
}

const DB_NAME = 'apiCacheDB';
const STORE_NAME = 'responses';

// Open IndexedDB
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    },
  });
}

// Save response to IndexedDB
export async function saveToCache(doc: CachedDocument) {
  const db = await getDB();
  await db.put(STORE_NAME, doc);
}

// Get response from IndexedDB
export async function getFromCache(key: string): Promise<CachedDocument | null> {
  const db = await getDB();
  return (await db.get(STORE_NAME, key)) || null;
}
