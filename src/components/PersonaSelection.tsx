import React from 'react';
import mamaGPortrait from '../assets/images/mama_g_portrait_1792645422205.jpg';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import {
  Baby,
  Stethoscope,
  Sparkles,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Smartphone,
  Laptop,
  Download,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { usePwa } from '../context/PwaContext';

export type PersonaType = 'expectant' | 'postpartum' | 'chw' | 'midlife';

export interface PersonaDetails {
  id: PersonaType;
  title: string;
  emoji: string;
  subtitle: string;
  description: string;
  highlights: string[];
  recommendedStartTab: string;
  themeColor: string;
  borderColor: string;
  accentBg: string;
}

export const PERSONAS: PersonaDetails[] = [
  {
    id: 'expectant',
    title: 'Expectant Mother',
    emoji: '🤰',
    subtitle: 'Pregnancy Journey & Fetal Health',
    description:
      'Track your 42-week gestational milestones, count baby kicks, triage pregnancy symptoms, and get evidence-based maternal nutrition advice.',
    highlights: [
      '42-Week Pregnancy Milestones',
      'Fetal Kick Counter with Alarm',
      'Danger Signs Symptom Triage',
      'Trimester Nutrition Guide',
    ],
    recommendedStartTab: 'journey',
    themeColor: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    accentBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
  },
  {
    id: 'postpartum',
    title: 'New Mother (Postpartum)',
    emoji: '👶',
    subtitle: 'Postnatal Healing & Newborn Care',
    description:
      'Compassionate support for postpartum depression (PPD) screening, infant care, breastfeeding nutrition, and free obstetric fistula (VVF) recovery.',
    highlights: [
      'PPD Mental Wellbeing Suite',
      'VVF & Fistula Recovery Hub',
      'Lactation & Healing Diet',
      'Postpartum Red Flag Warning',
    ],
    recommendedStartTab: 'ppd',
    themeColor: 'text-rose-400',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    accentBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
  },
  {
    id: 'chw',
    title: 'Health Worker (CHW)',
    emoji: '🏥',
    subtitle: 'Clinical Protocols & Notarization',
    description:
      'Evidence-based triage matrix for frontline Community Health Workers, WHO/FMOH obstetric protocols, Algorand health notarization, and 774 LGA referral centers.',
    highlights: [
      'Clinical Triage Matrix',
      'Algorand Blockchain Attestation',
      'Nigeria 774 LGA Clinic Directory',
      'CHW Field Treatment Guides',
    ],
    recommendedStartTab: 'triage',
    themeColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    accentBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
  },
  {
    id: 'midlife',
    title: 'Midlife / Other',
    emoji: '🌸',
    subtitle: 'Cycle, Menopause & Discretion',
    description:
      'Discreet menstrual cycle & ovulation prediction, perimenopause & hot flush symptom relief, confidential SRHR family planning, and Old Mama wisdom sanctuary.',
    highlights: [
      'Menstrual Cycle & Ovulation',
      'Menopause & Perimenopause Hub',
      'Confidential SRHR Planning',
      'G-Corner Wisdom Sanctuary',
    ],
    recommendedStartTab: 'cycle',
    themeColor: 'text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    accentBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
  },
];

interface PersonaSelectionProps {
  language: SupportedLanguage;
  onSelectPersona: (persona: PersonaType) => void;
  onOpenEmergency: () => void;
  onOpenGame?: () => void;
  onOpenSocial?: () => void;
}

export const PersonaSelection: React.FC<PersonaSelectionProps> = ({
  language,
  onSelectPersona,
  onOpenEmergency,
  onOpenGame,
  onOpenSocial,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  const { isInstalled, isDesktop, installApp, openInstallModal } = usePwa();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* Welcome Banner conforming to UNICEF Digital Public Goods with Mama-G Portrait */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col items-center justify-center gap-3 mb-3">
          <div className="relative">
            <img
              src={mamaGPortrait}
              alt="Mama-G - Maternal & Women's Health Assistant"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-400/90 shadow-xl"
            />
            <span
              className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-stone-900 rounded-full"
              title="Mama-G is Online & Ready"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UNICEF Digital Public Goods Standard · WCAG 2.1 AA</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Welcome, my sister! 🌺
        </h1>
        <p className="mt-2 text-base sm:text-lg text-amber-200/90 font-medium max-w-2xl mx-auto">
          Who are you using Mama-G for today?
        </p>
        <p className="mt-1 text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
          Select a role below to see tailored health tools, guidance, and clinical support. You can switch anytime.
        </p>
      </div>

      {/* Prominent Laptop & Phone Installation Card */}
      {!isInstalled && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600/25 via-stone-900 to-rose-600/20 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
              {isDesktop ? (
                <Laptop className="w-6 h-6 text-stone-950" />
              ) : (
                <Smartphone className="w-6 h-6 text-stone-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {isDesktop ? 'Install Mama-G on Your Laptop / PC' : 'Install Mama-G on Your Phone'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Works 100% Offline
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 max-w-xl">
                {isDesktop
                  ? 'Install as a standalone desktop app on Windows, Mac, or Chromebook. Run full screen without browser tabs in field clinics and hospitals.'
                  : 'Add directly to your Android or iPhone home screen. Works 100% offline in rural clinics and remote villages without mobile data.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={installApp}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer shrink-0"
          >
            {isDesktop ? <Laptop className="w-4 h-4 text-stone-950" /> : <Download className="w-4 h-4 text-stone-950" />}
            <span>{isDesktop ? 'Install on Laptop / PC' : 'Install on Phone'}</span>
          </button>
        </div>
      )}

      {/* 4 Accessible Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {PERSONAS.map((persona) => {
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className={`group relative text-left p-5 sm:p-6 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border ${persona.borderColor} transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex flex-col justify-between cursor-pointer min-h-[220px]`}
              aria-label={`Select ${persona.title}: ${persona.subtitle}`}
            >
              <div>
                {/* Header row with icon and subtitle */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl select-none" role="img" aria-label={persona.title}>
                      {persona.emoji}
                    </span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {persona.title}
                      </h2>
                      <span className={`text-xs font-semibold ${persona.themeColor}`}>
                        {persona.subtitle}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-xl ${persona.accentBg} flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1`}
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                  {persona.description}
                </p>

                {/* Key Highlights / Pills */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2">
                  {persona.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-400"
                    >
                      <CheckCircle2 className={`w-3 h-3 ${persona.themeColor} shrink-0`} />
                      <span className="truncate">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Touch Affordance */}
              <div className="pt-3 mt-3 border-t border-stone-800/80 flex items-center justify-between text-xs font-medium text-stone-400 group-hover:text-amber-300 transition-colors">
                <span>Open tailored tools</span>
                <span className="text-[11px] font-semibold text-stone-400 group-hover:text-stone-200">
                  Tap to begin →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3D Simulation Game Feature Banner */}
      {onOpenGame && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-300">
                  3D Game: Midwife Odyssey — Savanna Sprint
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Three.js 60FPS
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Sprint through rural savanna outposts, leap obstacles, deliver sterile birth kits, and solve clinical triage questions!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenGame}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Play 3D Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Major Social Media Handles & Maternal Community Banner */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/20 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
            💬
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white">
                Join 45k+ Sisters & CHWs on Social Media
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                @MamaGHealth
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              WhatsApp Support Circle · X (Twitter) · Instagram · Telegram · Facebook · TikTok
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <a
            href="https://chat.whatsapp.com/invite/MamaGMaternalCare"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>WhatsApp Circle</span>
          </a>
          {onOpenSocial && (
            <button
              onClick={onOpenSocial}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>All Handles & Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice & Direct SOS Trigger */}
      <div className="mt-6 p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            <strong className="text-stone-200">Experiencing severe bleeding, fever, or acute danger?</strong> You do not need to choose a role.
          </span>
        </div>
        <button
          onClick={onOpenEmergency}
          className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
          <span>Open Emergency SOS</span>
        </button>
      </div>
    </div>
  );
};
