import { useEffect, useState, useRef, useCallback } from 'react';
import { MamaGSyncReconnectionManager } from './MamaGSyncReconnectionManager';

export function useNetworkSync(
  hubApiUrl: string,
  deviceId: string,
  isSimulatedOffline: boolean = false
) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine && !isSimulatedOffline : !isSimulatedOffline
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastSyncedCount, setLastSyncedCount] = useState<number>(0);
  const managerRef = useRef<MamaGSyncReconnectionManager | null>(null);
  const simulatedRef = useRef<boolean>(isSimulatedOffline);

  useEffect(() => {
    simulatedRef.current = isSimulatedOffline;
    setIsOnline((typeof navigator !== 'undefined' ? navigator.onLine : true) && !isSimulatedOffline);
    managerRef.current?.updateOfflinePredicate(() => simulatedRef.current);

    // Trigger sync automatically when simulated offline is turned back off
    if (!isSimulatedOffline && (typeof navigator === 'undefined' || navigator.onLine)) {
      void managerRef.current?.triggerSyncCycle();
    }
  }, [isSimulatedOffline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(!simulatedRef.current);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    managerRef.current = new MamaGSyncReconnectionManager({
      hubApiUrl,
      deviceId,
      isOfflineFn: () => simulatedRef.current,
      onSyncStart: () => setIsSyncing(true),
      onSyncSuccess: (syncedCount) => {
        setIsSyncing(false);
        setLastSyncedCount(syncedCount);
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      },
      onSyncError: () => setIsSyncing(false),
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      managerRef.current?.destroyListeners();
    };
  }, [hubApiUrl, deviceId]);

  const forceManualSync = useCallback(async (): Promise<number> => {
    if (!managerRef.current) return 0;
    return managerRef.current.triggerSyncCycle();
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    lastSyncedCount,
    forceManualSync,
  };
}
