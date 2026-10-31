import { AlertTriangle, ShieldCheck, EyeOff, LogIn, User, Download, Smartphone, Laptop, Share2 } from 'lucide-react';
import mamaGPortrait from '../assets/images/mama_g_portrait_1792645422205.jpg';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useAuth } from '../context/AuthContext';
import { usePwa } from '../context/PwaContext';
import { useCrypto } from '../context/CryptoContext';
import { PersonaType } from './PersonaSelection';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenEmergency: () => void;
  onDiscreetExit: () => void;
  onOpenAuth: () => void;
  onOpenCrypto?: () => void;
  onOpenSocial?: () => void;
  selectedPersona?: PersonaType | null;
  onResetPersona?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  onOpenEmergency,
  onDiscreetExit,
  onOpenAuth,
  onOpenCrypto,
  onOpenSocial,
  selectedPersona,
  onResetPersona,
}) => {
  const { user } = useAuth();
  const { address, receipts, formatAddress } = useCrypto();
  const { isInstalled, isDesktop, installApp, openInstallModal } = usePwa();

  const languages: SupportedLanguage[] = [
    'English',
    'Nigerian Pidgin',
    'Swahili',
    'French',
    'Hausa',
    'Yoruba',
  ];

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md backdrop-blur-md bg-stone-900/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[4.25rem] py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Round Picture of Mama-G + Large Visible Logo & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <button
            type="button"
            onClick={onResetPersona}
            className="flex items-center gap-2.5 sm:gap-3.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl p-1 -m-1 cursor-pointer transition-transform active:scale-95"
            aria-label="Mama-G - Back to Persona Selection"
            title="Mama-G: Tap to return to Home"
          >
            {/* Round Picture of Woman Mentor on Left-Hand Side */}
            <div className="relative shrink-0">
              <img
                src={mamaGPortrait}
                alt="Mama-G Midwife & Maternal Mentor"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover ring-2 ring-amber-400 shadow-lg group-hover:ring-amber-300 transition-all"
              />
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full"
                title="Mama-G is Online & Ready"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors leading-tight">
                  Mama-G
                </span>
                <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Hibiscus flower">
                  🌺
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-amber-200/95 tracking-wide leading-tight mt-0.5">
                {t.appSubtitle || "Maternal & Women's Health Assistant"}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Language Selector dropdown, Utilities, and Prominent Red Emergency SOS Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              id="header-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="h-9 sm:h-10 bg-stone-800 text-stone-100 text-xs sm:text-sm rounded-lg px-2 sm:px-2.5 border border-stone-700 hover:border-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer font-medium appearance-auto pr-6"
              aria-label="Language Selector"
              title="Select Language"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-stone-800 text-stone-100">
                  {lang === 'Nigerian Pidgin' ? 'Pidgin' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Exit / Discretion for Sensitive SRHR Privacy */}
          <button
            type="button"
            onClick={onDiscreetExit}
            className="h-9 sm:h-10 px-2 sm:px-2.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1 border border-stone-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title={t.discreetExit}
            aria-label={t.discreetExit}
          >
            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline text-[11px] font-medium">{t.discreetExit}</span>
          </button>

          {/* Algorand Anonymous Identity Button */}
          {onOpenCrypto && (
            <button
              type="button"
              onClick={onOpenCrypto}
              className="h-9 sm:h-10 px-2 sm:px-2.5 text-xs rounded-lg flex items-center gap-1 border transition-colors bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/30 hover:border-amber-500/50 shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={address ? `Algorand Anonymous Identity: ${address}` : 'Algorand Anonymous Keystore & Health Ledger'}
              aria-label="Algorand Anonymous Health Ledger"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden lg:inline font-mono text-[11px] font-semibold">
                {address ? formatAddress(address, 3, 3) : 'Algo ID'}
              </span>
              {receipts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center justify-center border border-amber-500/40">
                  {receipts.length}
                </span>
              )}
            </button>
          )}

          {/* User Sign In / Account Button */}
          <button
            type="button"
            onClick={onOpenAuth}
            className={`h-9 sm:h-10 px-2 sm:px-2.5 text-xs rounded-lg flex items-center gap-1 border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
              user
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title={user ? `${t.account}: ${user.email}` : t.signIn}
            aria-label={user ? t.account : t.signIn}
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
            <span className="hidden xl:inline font-medium text-[11px]">
              {user ? (user.displayName ? user.displayName.split(' ')[0] : t.account) : t.signIn}
            </span>
          </button>

          {/* PWA Install Button for Laptops & Phones */}
          {!isInstalled && (
            <button
              type="button"
              onClick={installApp}
              className="h-9 sm:h-10 px-2 sm:px-2.5 bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/45 hover:to-rose-600/45 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-amber-500/40 transition-colors shadow-sm cursor-pointer shrink-0"
              title={isDesktop ? "Install Mama-G on your laptop or computer" : "Install Mama-G on your phone"}
              aria-label={isDesktop ? "Install on Laptop" : "Install App on Phone"}
            >
              {isDesktop ? (
                <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isDesktop ? 'Install on PC' : 'Install'}
              </span>
            </button>
          )}

          {/* Social Media & Share Modal Trigger */}
          {onOpenSocial && (
            <button
              type="button"
              onClick={onOpenSocial}
              className="h-9 sm:h-10 px-2 sm:px-2.5 text-xs text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 rounded-lg flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
              title="Connect on Social Media & Share Mama-G"
              aria-label="Social Media Handles & Share"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold text-[11px]">Share</span>
            </button>
          )}

          {/* Prominent Red Emergency SOS Button - Meeting WCAG 2.1 AA and DPG touch target requirements */}
          <button
            type="button"
            onClick={onOpenEmergency}
            className="h-9 sm:h-10 px-3 sm:px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 min-w-[44px]"
            aria-label="Emergency SOS - Immediate Maternal Emergency Help"
            title="Emergency SOS: Immediate guidance for acute bleeding, eclampsia, or danger signs"
          >
            <AlertTriangle className="w-4 h-4 text-rose-100 shrink-0" />
            <span className="font-extrabold tracking-tight">🚨 Emergency SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
