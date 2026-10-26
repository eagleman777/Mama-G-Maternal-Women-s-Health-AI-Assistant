import React from 'react';
import { Wifi, WifiOff, Download, CheckCircle, RefreshCw, X } from 'lucide-react';
import { usePwa } from '../context/PwaContext';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface OfflineIndicatorProps {
  language: SupportedLanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const {
    isOffline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    isInstallable,
    isInstalled,
    installApp,
    offlineReady,
    needRefresh,
    updateApp,
    dismissRefresh,
  } = usePwa();

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  return (
    <>
      {/* Update Available notification */}
      {needRefresh && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-md z-50 animate-fadeIn">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>A new updated version of Mama-G is available.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={updateApp}
              className="px-2.5 py-1 bg-white text-emerald-800 rounded font-semibold hover:bg-emerald-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={dismissRefresh}
              className="p-1 hover:bg-emerald-600 rounded text-emerald-100"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready notification */}
      {offlineReady && (
        <div className="bg-stone-800 text-stone-200 border-b border-stone-700 px-4 py-2 text-xs flex items-center justify-between gap-2 shadow-sm z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>{t.offlineReadyTitle}:</strong> {t.offlineReadyDesc}
            </span>
          </div>
        </div>
      )}

      {/* In-app install banner if installable and not in standalone */}
      {isInstallable && !isInstalled && (
        <div className="bg-gradient-to-r from-amber-700 to-rose-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-sm z-40">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 shrink-0 text-amber-200" />
            <span className="truncate">{t.installAppBanner}</span>
          </div>
          <button
            onClick={installApp}
            className="px-3 py-1 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-stone-100 transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.installApp}</span>
          </button>
        </div>
      )}

      {/* Offline Banner Bar when connection is offline */}
      {isOffline && (
        <div className="bg-amber-600 text-stone-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.offlineNotice}</span>
            {isSimulatedOffline && (
              <span className="bg-amber-800/40 text-amber-950 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                Simulation Active
              </span>
            )}
          </div>
          <button
            onClick={toggleSimulatedOffline}
            className="hidden sm:inline-flex items-center text-[11px] underline opacity-85 hover:opacity-100"
          >
            {isSimulatedOffline ? 'Resume Online Network' : t.simulateOfflineToggle}
          </button>
        </div>
      )}
    </>
  );
};
