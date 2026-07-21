'use client';
import { openDB } from 'idb';

// Offline-first data layer.
// - Every read goes through here: it serves cached IndexedDB data instantly,
//   then refreshes from Supabase in the background when online.
// - Every write goes through here: it applies instantly to IndexedDB (so the UI
//   never waits on the network) and enqueues a mutation to replay against
//   Supabase once a connection is available.
// - Mutations carry a client-generated op_id. sync_log on the server makes
//   replays idempotent, so a retried sync can never double-apply or overwrite
//   newer data (last-write-wins is avoided in favor of "never lose a write").

const DB_NAME = 'physics-tutor-offline';
const DB_VERSION = 1;

let dbPromise = null;

export function getDb() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('groups')) {
          db.createObjectStore('groups', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const store = db.createObjectStore('attendance', { keyPath: 'id' });
          store.createIndex('by_student', 'student_id');
        }
        if (!db.objectStoreNames.contains('payments')) {
          const store = db.createObjectStore('payments', { keyPath: 'id' });
          store.createIndex('by_student', 'student_id');
        }
        if (!db.objectStoreNames.contains('mutationQueue')) {
          db.createObjectStore('mutationQueue', { keyPath: 'op_id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheAll(storeName, rows) {
  const db = await getDb();
  if (!db) return;
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all(rows.map((r) => tx.store.put(r)));
  await tx.done;
}

export async function cacheOne(storeName, row) {
  const db = await getDb();
  if (!db) return;
  await db.put(storeName, row);
}

export async function getAllCached(storeName) {
  const db = await getDb();
  if (!db) return [];
  return db.getAll(storeName);
}

export async function getCachedByStudent(storeName, studentId) {
  const db = await getDb();
  if (!db) return [];
  return db.getAllFromIndex(storeName, 'by_student', studentId);
}

// Queue a write to be replayed against Supabase. table/op/payload describe
// exactly what to do; op_id makes retries safe.
export async function queueMutation({ table, op, payload }) {
  const db = await getDb();
  if (!db) return;
  const op_id = crypto.randomUUID();
  await db.put('mutationQueue', {
    op_id,
    table,
    op, // 'upsert' | 'delete'
    payload,
    created_at: new Date().toISOString(),
  });
  return op_id;
}

export async function getQueuedMutations() {
  const db = await getDb();
  if (!db) return [];
  return db.getAll('mutationQueue');
}

export async function removeQueuedMutation(op_id) {
  const db = await getDb();
  if (!db) return;
  await db.delete('mutationQueue', op_id);
}

export async function setMeta(key, value) {
  const db = await getDb();
  if (!db) return;
  await db.put('meta', { key, value });
}

export async function getMeta(key) {
  const db = await getDb();
  if (!db) return null;
  const row = await db.get('meta', key);
  return row ? row.value : null;
}
