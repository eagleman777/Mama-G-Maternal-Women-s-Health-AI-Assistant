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
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isMac: boolean;
  isWindows: boolean;
  isChromeOS: boolean;
  isInIframe: boolean;
  openInNewWindow: () => void;
  installApp: () => Promise<boolean>;
  isInstallModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
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
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [isMac, setIsMac] = useState<boolean>(false);
  const [isWindows, setIsWindows] = useState<boolean>(false);
  const [isChromeOS, setIsChromeOS] = useState<boolean>(false);
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [isInIframe, setIsInIframe] = useState<boolean>(inIframe);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);
  const [updateSWFn, setUpdateSWFn] = useState<(() => Promise<void>) | null>(null);

  const openInNewWindow = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    // Check if running in standalone mode (already installed on phone/desktop)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // Detect device OS & Mobile status
    const ua = (window.navigator.userAgent || '').toLowerCase();
    const platform = (window.navigator.platform || '').toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || (platform.includes('mac') && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    const isMobileDevice = isIosDevice || isAndroidDevice || /mobile|blackberry|iemobile|opera mini/.test(ua);
    const isDesktopDevice = !isMobileDevice;
    const isMacDevice = (/mac|darwin/.test(platform) || /macintosh/.test(ua)) && !isIosDevice;
    const isWindowsDevice = /win/.test(platform) || /windows/.test(ua);
    const isChromeOSDevice = /cros/.test(ua);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);
    setIsDesktop(isDesktopDevice);
    setIsMac(isMacDevice);
    setIsWindows(isWindowsDevice);
    setIsChromeOS(isChromeOSDevice);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for standard Chromium / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register VitePWA service worker with auto-update & offline hooks
    try {
      const updateSW = registerSW({
        immediate: true,
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

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // If browser doesn't support direct prompt (e.g. Safari on iOS, or in-app browser), open the guided modal
      setIsInstallModalOpen(true);
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to trigger PWA install:', err);
      setIsInstallModalOpen(true);
      return false;
    }
  };

  const openInstallModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

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
        isIOS,
        isAndroid,
        isMobile,
        isDesktop,
        isMac,
        isWindows,
        isChromeOS,
        isInIframe,
        openInNewWindow,
        installApp,
        isInstallModalOpen,
        openInstallModal,
        closeInstallModal,
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
