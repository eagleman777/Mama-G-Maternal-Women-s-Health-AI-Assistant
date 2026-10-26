import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isOffline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
  offlineReady: boolean;
  needRefresh: boolean;
  updateApp: () => void;
  dismissRefresh: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export const PwaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);
  const [updateSWFn, setUpdateSWFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for the PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register VitePWA service worker with auto-update & offline hooks
    try {
      const updateSW = registerSW({
        onOfflineReady() {
          setOfflineReady(true);
          setTimeout(() => setOfflineReady(false), 8000);
        },
        onNeedRefresh() {
          setNeedRefresh(true);
        },
      });
      setUpdateSWFn(() => updateSW);
    } catch (err) {
      console.warn('PWA service worker registration notice:', err);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setIsInstallable(false);
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Failed to trigger PWA install:', err);
    }
  };

  const updateApp = () => {
    if (updateSWFn) {
      updateSWFn();
    }
  };

  const dismissRefresh = () => {
    setNeedRefresh(false);
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const effectiveOffline = isOffline || isSimulatedOffline;

  return (
    <PwaContext.Provider
      value={{
        isOffline: effectiveOffline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        isInstallable,
        isInstalled,
        installApp,
        offlineReady,
        needRefresh,
        updateApp,
        dismissRefresh,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = (): PwaContextType => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
};
