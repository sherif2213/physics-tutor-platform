'use client';
import { supabase } from './supabaseClient';
import { getQueuedMutations, removeQueuedMutation, setMeta } from './offlineDb';

// Replays the local mutation queue against Supabase in order, oldest first.
// Each mutation is skipped (and dequeued) if it was already applied — the
// server-side sync_log table records op_id, so a crash mid-sync or a duplicate
// call from two tabs can never double-write or overwrite a newer change.
let syncing = false;

export async function runSync() {
  if (syncing) return { ok: true, skipped: true };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, reason: 'offline' };
  }
  syncing = true;
  try {
    const queue = await getQueuedMutations();
    queue.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    for (const mutation of queue) {
      const { op_id, table, op, payload } = mutation;

      // Idempotency check: has this exact operation already landed?
      const { data: already } = await supabase
        .from('sync_log')
        .select('client_op_id')
        .eq('client_op_id', op_id)
        .maybeSingle();

      if (already) {
        await removeQueuedMutation(op_id);
        continue;
      }

      let error;
      if (op === 'upsert') {
        const { __conflictKey, ...cleanPayload } = payload;
        ({ error } = await supabase.from(table).upsert(cleanPayload, {
          onConflict: __conflictKey || undefined,
        }));
      } else if (op === 'delete') {
        ({ error } = await supabase.from(table).delete().eq('id', payload.id));
      }

      if (error) {
        // Leave it queued — will retry on next sync pass.
        console.error('Sync error for', table, op, error.message);
        continue;
      }

      await supabase.from('sync_log').insert({ client_op_id: op_id });
      await removeQueuedMutation(op_id);
    }

    await setMeta('lastSyncAt', new Date().toISOString());
    return { ok: true };
  } finally {
    syncing = false;
  }
}

export function watchConnectivity(onChange) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    onChange(navigator.onLine);
    if (navigator.onLine) runSync();
  };
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  // Periodic retry in case 'online' event is missed
  const interval = setInterval(() => {
    if (navigator.onLine) runSync();
  }, 30000);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
    clearInterval(interval);
  };
}
