'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { runSync, watchConnectivity } from '@/lib/syncEngine';
import { getQueuedMutations } from '@/lib/offlineDb';

const SyncContext = createContext({ online: true, pendingCount: 0 });
export const useSync = () => useContext(SyncContext);

export function SyncProvider({ children }) {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = async () => {
    const q = await getQueuedMutations();
    setPendingCount(q.length);
  };

  useEffect(() => {
    setOnline(navigator.onLine);
    refreshPending();
    const stop = watchConnectivity((isOnline) => setOnline(isOnline));
    const interval = setInterval(refreshPending, 4000);
    return () => {
      stop();
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    await runSync();
    await refreshPending();
    setSyncing(false);
  };

  return (
    <SyncContext.Provider value={{ online, pendingCount, runSync: handleManualSync }}>
      {children}
      {(!online || pendingCount > 0) && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 z-50 flex items-center gap-3 glass-card px-4 py-3 text-sm">
          {!online ? (
            <WifiOff size={18} className="text-amber-400 shrink-0" />
          ) : (
            <RefreshCw size={18} className={`text-teal-400 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
          )}
          <span className="text-slate-200">
            {!online
              ? 'أنت غير متصل بالإنترنت — التغييرات محفوظة محليًا وستتم مزامنتها تلقائيًا'
              : `جارٍ حفظ ${pendingCount} تغييرًا في قاعدة البيانات...`}
          </span>
          {online && pendingCount > 0 && (
            <button onClick={handleManualSync} className="text-amber-400 font-bold shrink-0">
              مزامنة الآن
            </button>
          )}
        </div>
      )}
    </SyncContext.Provider>
  );
}
