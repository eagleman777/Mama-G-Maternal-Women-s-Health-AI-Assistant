import React from 'react';
import { AlertTriangle, ShieldCheck, HeartHandshake, EyeOff, LogIn, User, Wifi, WifiOff, Download, Check } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useAuth } from '../context/AuthContext';
import { usePwa } from '../context/PwaContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenEmergency: () => void;
  onDiscreetExit: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenEmergency,
  onDiscreetExit,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const {
    isOffline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    isInstallable,
    isInstalled,
    installApp,
  } = usePwa();
  const languages: SupportedLanguage[] = [
    'English',
    'Nigerian Pidgin',
    'Swahili',
    'French',
    'Hausa',
    'Yoruba',
  ];

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  const navItems = [
    { id: 'assistant', label: t.navAssistant },
    { id: 'facilities', label: t.navFacilities },
    { id: 'gcorner', label: t.navGCorner },
    { id: 'menopause', label: t.navMenopause },
    { id: 'nutrition', label: t.navNutrition },
    { id: 'cycle', label: t.navCycle },
    { id: 'triage', label: t.navTriage },
    { id: 'vvf', label: t.navVvf },
    { id: 'ppd', label: t.navPpd },
    { id: 'journey', label: t.navJourney },
    { id: 'chw', label: t.navChw },
    { id: 'srhr', label: t.navSrhr },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md bg-stone-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark & Network Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors leading-tight">
                Mama-G
              </span>
              <span className="hidden sm:inline-block text-[11px] text-stone-400">
                {t.appSubtitle}
              </span>
            </div>
          </button>

          {/* Badges container outside brand button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 100% Free Mode Badge */}
            <span
              className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
              title={t.freeModeInfo}
            >
              {t.freeModeBadge}
            </span>

            {/* Network Status Badge */}
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
              title={
                isSimulatedOffline
                  ? 'Offline simulation mode active. Click to resume online.'
                  : isOffline
                  ? 'Offline mode active (Local cached rules & safe data).'
                  : 'Live online sync active. Click to test offline mode.'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {isOffline ? (isSimulatedOffline ? 'Sim Offline' : 'Offline') : 'Live Sync'}
              </span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 text-sm ${
                  isActive
                    ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Language, Quick Exit, Emergency SOS) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 border border-stone-700 focus:outline-none focus:border-amber-500 whitespace-nowrap font-medium"
            title="Select Language"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Quick Exit / Discretion button for sensitive SRHR privacy */}
          <button
            onClick={onDiscreetExit}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1.5 border border-stone-700 transition-colors"
            title={t.discreetExit}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.discreetExit}</span>
          </button>

          {/* User Sign In / Account Button */}
          <button
            onClick={onOpenAuth}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg flex items-center gap-1.5 border transition-colors ${
              user
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title={user ? `${t.account}: ${user.email}` : t.signIn}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : user ? (
              <User className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline font-medium">
              {user ? (user.displayName ? user.displayName.split(' ')[0] : t.account) : t.signIn}
            </span>
          </button>

          {/* PWA Install Button for Home Screen / Offline Access */}
          {isInstallable && !isInstalled && (
            <button
              onClick={installApp}
              className="px-2 sm:px-3 py-1.5 bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-amber-500/40 transition-colors shadow-sm whitespace-nowrap"
              title={t.installApp}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.installApp}</span>
            </button>
          )}

          {/* Primary Action: Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="px-3 sm:px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-4 h-4 text-rose-200" />
            <span>{t.emergencySos}</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="lg:hidden flex overflow-x-auto no-scrollbar border-t border-stone-800 px-3 py-2 gap-2 bg-stone-900/90">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 bg-stone-800/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
