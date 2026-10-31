import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Monitor,
  Share2,
  CheckCircle2,
  QrCode,
  WifiOff,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowRight,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePwa } from '../context/PwaContext';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface InstallPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({
  isOpen,
  onClose,
  language = 'English',
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    isMac,
    isWindows,
    isChromeOS,
    isInIframe,
    openInNewWindow,
    installApp,
  } = usePwa();

  const [activePlatform, setActivePlatform] = useState<'laptop' | 'android' | 'ios' | 'qr'>('laptop');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-detect initial platform based on device
  useEffect(() => {
    if (isDesktop) {
      setActivePlatform('laptop');
    } else if (isIOS) {
      setActivePlatform('ios');
    } else {
      setActivePlatform('android');
    }
  }, [isDesktop, isIOS, isAndroid]);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Generate dynamic QR code for current app URL
  useEffect(() => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#1c1917',
          light: '#fafaf9',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate install QR code:', err));
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await installApp();
      if (accepted) {
        onClose();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-600/30 via-rose-600/20 to-stone-900 p-4 sm:p-5 border-b border-stone-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md text-xl shrink-0 font-bold">
              🌺
            </div>
            <div>
              <h2 id="install-modal-title" className="text-lg sm:text-xl font-extrabold text-white leading-tight flex items-center gap-2">
                <span>Install Mama-G</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {isDesktop ? 'Laptop & PC App' : 'Mobile Phone App'}
                </span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                100% Free · Works Offline · Standalone Desktop & Phone App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* In-Frame Notification: Essential for AI Studio Build & Preview */}
          {isInIframe && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-stone-850 to-teal-500/20 border border-amber-500/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Preview Frame Detected:</span>
                  <p className="text-stone-300 text-[11px] mt-0.5">
                    Web browsers require a direct top-level window to install desktop apps onto your taskbar or dock.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openInNewWindow}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md cursor-pointer whitespace-nowrap active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
                <span>Open in Full Tab & Install</span>
              </button>
            </div>
          )}

          {/* Quick 1-Click Install Alert if browser supports beforeinstallprompt */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/15 border border-amber-500/40 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant 1-Click {isDesktop ? 'Laptop' : 'Phone'} Install Ready</span>
                  </div>
                  <p className="text-xs text-stone-200">
                    Your browser has prepared Mama-G for direct installation. Click below to install directly to your {isDesktop ? 'desktop taskbar / dock' : 'phone home screen'}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="mt-3 w-full h-11 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-[0.99]"
              >
                {isDesktop ? <Laptop className="w-4 h-4 text-stone-950" /> : <Download className="w-4 h-4 text-stone-950" />}
                <span>
                  {isInstalling
                    ? 'Installing...'
                    : isDesktop
                    ? 'Install Mama-G on This Laptop Now'
                    : 'Install to Phone Home Screen Now'}
                </span>
              </button>
            </div>
          )}

          {/* Already installed state */}
          {isInstalled && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Mama-G is Installed as an App
                </h3>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Running in standalone mode. All clinical triage matrix rules, facilities, and Algorand credentials are saved locally for 100% offline access!
                </p>
              </div>
            </div>
          )}

          {/* Device & Platform Selector Tabs */}
          <div>
            <div className="flex rounded-xl bg-stone-800 p-1 border border-stone-700 overflow-x-auto no-scrollbar gap-1">
              <button
                type="button"
                onClick={() => setActivePlatform('laptop')}
                className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePlatform === 'laptop'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>💻 Laptop / PC</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('android')}
                className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePlatform === 'android'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>🤖 Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('ios')}
                className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePlatform === 'ios'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>🍎 iPhone</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('qr')}
                className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePlatform === 'qr'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Scan QR Code to open on phone"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Code</span>
              </button>
            </div>

            {/* Laptop / PC Instructions */}
            {activePlatform === 'laptop' && (
              <div className="mt-3 p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-4 animate-fade-in text-xs">
                {/* Visual Browser Address Bar Mockup */}
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-750 space-y-2">
                  <div className="text-[11px] font-semibold text-stone-400 flex items-center justify-between">
                    <span>Browser Address Bar Guide</span>
                    <span className="text-amber-400 font-mono">Chrome / Edge / Brave</span>
                  </div>

                  {/* Address bar graphic */}
                  <div className="flex items-center justify-between bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-400 truncate">
                      <span className="text-emerald-400">🔒</span>
                      <span className="text-stone-300 font-mono text-[11px] truncate">
                        {typeof window !== 'undefined' ? window.location.host : 'mama-g.app'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Highlighted Install Icon */}
                      <div className="relative group">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[11px] animate-pulse">
                          <Laptop className="w-3 h-3 text-amber-400" />
                          <span>Install</span>
                        </div>
                        {/* Pointer label */}
                        <div className="absolute -top-7 right-0 bg-amber-500 text-stone-950 font-black text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          Click here ⬆️
                        </div>
                      </div>
                      <span className="text-stone-500">⋮</span>
                    </div>
                  </div>
                </div>

                {/* Chrome / Edge / Brave Steps */}
                <div className="space-y-2.5">
                  <div className="text-amber-300 font-bold flex items-center gap-1.5 border-b border-stone-800 pb-1.5">
                    <Monitor className="w-3.5 h-3.5 text-teal-400" />
                    <span>On Windows, Chromebook, or Linux (Chrome / Edge / Brave):</span>
                  </div>

                  <ol className="space-y-2 text-stone-300 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        1
                      </span>
                      <div>
                        Look at the right side of your <strong>browser URL address bar</strong> at the top of this window.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        2
                      </span>
                      <div>
                        Click the <strong>Install icon</strong> (🖥️ monitor with downward arrow or "Install app").
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        3
                      </span>
                      <div>
                        Or click the <strong>three dots menu (⋮ or ⋯)</strong> at the top right → select <strong>"Install Mama-G"</strong> or <strong>"Save and share" → "Install page as app"</strong>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        4
                      </span>
                      <div>
                        Click <strong>"Install"</strong>. Mama-G will launch in its own desktop window and be pinned to your <strong>Windows Taskbar, Start Menu, or Chromebook shelf</strong>!
                      </div>
                    </li>
                  </ol>
                </div>

                {/* macOS Safari Steps */}
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <div className="text-amber-300 font-bold flex items-center gap-1.5 pb-1">
                    <span>🍎 On Apple Mac (macOS Safari Sonoma 14+ or Chrome for Mac):</span>
                  </div>

                  <ol className="space-y-1.5 text-stone-300 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-stone-700 text-stone-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div>
                        In Safari, click <strong>File</strong> in the top Mac menu bar (next to Apple  logo).
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-stone-700 text-stone-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        Select <strong>"Add to Dock..."</strong> and click <strong>"Add"</strong>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-stone-700 text-stone-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div>
                        Mama-G is now an independent application in your <strong>Mac Dock</strong> and <strong>Applications folder</strong>!
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Instant Actions Bar for Laptop */}
                <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={openInNewWindow}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open in Dedicated Browser Window</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Field Clinic Kiosk Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {activePlatform === 'android' && (
              <div className="mt-3 p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-stone-800 pb-2">
                  <span>How to Install on Android Phone:</span>
                  <span className="text-[11px] text-stone-400">Chrome, Samsung, Edge, Opera</span>
                </div>

                <ol className="space-y-2.5 text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      1
                    </span>
                    <div>
                      Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      2
                    </span>
                    <div>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      3
                    </span>
                    <div>
                      Tap <strong>"Install"</strong>. The 🌺 Mama-G icon will appear on your phone home screen!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {activePlatform === 'ios' && (
              <div className="mt-3 p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-stone-800 pb-2">
                  <span>How to Install on iPhone / iPad:</span>
                  <span className="text-[11px] text-stone-400">Apple Safari</span>
                </div>

                <ol className="space-y-2.5 text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      1
                    </span>
                    <div>
                      Open this link in <strong>Safari</strong> on your iPhone or iPad.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      2
                    </span>
                    <div>
                      Tap the <strong>Share button</strong> (the square with an arrow pointing up <span className="font-mono text-amber-400">⎋</span>) at the bottom toolbar.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      3
                    </span>
                    <div>
                      Scroll down and tap <strong>"Add to Home Screen" ➕</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      4
                    </span>
                    <div>
                      Tap <strong>"Add"</strong> in the top-right corner. Done!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* QR Code / Share to Phone */}
            {activePlatform === 'qr' && (
              <div className="mt-3 p-4 rounded-xl bg-stone-850 border border-stone-800 text-center space-y-3 animate-fade-in">
                <p className="text-xs text-stone-300 font-medium">
                  Scan this code with your phone camera to open and install Mama-G immediately:
                </p>

                {qrCodeDataUrl ? (
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-lg border border-stone-300">
                    <img
                      src={qrCodeDataUrl}
                      alt="Mama-G Install QR Code"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-stone-800 rounded-2xl flex items-center justify-center text-xs text-stone-400">
                    Generating QR...
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Link for WhatsApp / Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Key Advantages of Installing on Laptop / Desktop */}
          <div className="border-t border-stone-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Why Install Mama-G on Laptops & Workstations?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-850/60 border border-stone-800 flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">Distraction-Free Window:</strong>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Runs in its own clean window without browser address bars, tabs, or accidental closures.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-850/60 border border-stone-800 flex items-start gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">100% Offline Clinical EMR:</strong>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Field nurses, doctors, and CHWs can carry laptops into rural clinics with zero internet connection.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-850/60 border border-stone-800 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">Instant Launch (Start Menu/Dock):</strong>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Launch directly from Windows Taskbar or macOS Dock. Zero .exe download or admin permissions needed.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-850/60 border border-stone-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">Private Cryptographic Keystore:</strong>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Algorand keys and triage attestations remain securely encrypted on your local computer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-3 sm:p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>UNICEF Digital Public Goods compliant · Works on Windows, Mac, Linux, Android, iOS</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
